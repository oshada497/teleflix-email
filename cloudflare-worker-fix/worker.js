export default {
  async fetch(request, env) {
    if (request.method === 'POST') {
      const update = await request.json();
      await handleUpdate(update, env);
      return new Response('OK', { status: 200 });
    }
    return new Response('Bot is running!', { status: 200 });
  }
};

// Gemini API translation function with safety settings
async function translateToSinhala(englishText, env) {
  // Use env variable if available, otherwise fallback to hardcoded key
  const GEMINI_API_KEY = env.GEMINI_API_KEY || 'AIzaSyDISsCkK4Pnpx114cXEwl8YQIrEf9apSSM';
  // Use v1beta API endpoint with Gemini 2.5 Flash model
  const GEMINI_API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`;

  const prompt = `You are a professional film content creator for a premium movie streaming platform. Your task is to transcreate the following movie description into high-quality, cinematic Sinhala.

IMPORTANT GUIDELINES:
- Tone: Professional, dramatic, and engaging (suitable for a movie site like Netflix or Prime Video).
- Style: Use "Written Sinhala" (Likhitha) grammar for the main narration, but make it flow with cinematic excitement.
- Avoid: overly casual slang (like "අපේ සුපර්මෑන්") and overly stiff/archaic words.
- Focus: Highlight the conflict, emotion, and stakes of the plot directly.
- Structure: Write it as a compelling synopsis that makes the viewer want to watch the movie immediately.

English Description:
${englishText}

Provide ONLY the professional Sinhala synopsis:`;

  try {
    const response = await fetch(GEMINI_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: prompt
          }]
        }],
        safetySettings: [
          {
            category: "HARM_CATEGORY_HARASSMENT",
            threshold: "BLOCK_NONE"
          },
          {
            category: "HARM_CATEGORY_HATE_SPEECH",
            threshold: "BLOCK_NONE"
          },
          {
            category: "HARM_CATEGORY_SEXUALLY_EXPLICIT",
            threshold: "BLOCK_NONE"
          },
          {
            category: "HARM_CATEGORY_DANGEROUS_CONTENT",
            threshold: "BLOCK_NONE"
          }
        ],
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 8000
        }
      })
    });

    const data = await response.json();

    // Check for API errors
    if (!response.ok) {
      console.error('Gemini API error:', data);
      return { success: false, error: `API error: ${data.error?.message || 'Unknown error'}`, fallback: englishText };
    }

    // Check if response was blocked
    if (data.candidates && data.candidates[0]?.finishReason === 'SAFETY') {
      console.error('Translation blocked by safety filters');
      return { success: false, error: 'Content blocked by safety filters', fallback: englishText };
    }

    // Extract translated text
    if (data.candidates && data.candidates[0] && data.candidates[0].content && data.candidates[0].content.parts && data.candidates[0].content.parts[0]) {
      const sinhalaText = data.candidates[0].content.parts[0].text;
      if (sinhalaText && sinhalaText.trim()) {
        return { success: true, text: sinhalaText.trim() };
      }
    }

    console.error('No translation in response:', data);
    return { success: false, error: 'No translation in response', fallback: englishText };

  } catch (error) {
    console.error('Translation error:', error);
    return { success: false, error: error.message, fallback: englishText };
  }
}

async function handleUpdate(update, env) {
  const message = update.message;
  const callbackQuery = update.callback_query;

  if (message) {
    await handleMessage(message, env);
  } else if (callbackQuery) {
    await handleCallbackQuery(callbackQuery, env);
  }
}

async function handleMessage(message, env) {
  const chatId = message.chat.id;
  const text = message.text;
  const userId = `user_${chatId}`;

  // Get user state
  const stateJSON = await env.USER_STATES.get(userId);
  const state = stateJSON ? JSON.parse(stateJSON) : { step: 'main_menu' };

  if (text === '/start') {
    await showMainMenu(chatId, env);
    state.step = 'main_menu';
    await env.USER_STATES.put(userId, JSON.stringify(state));
    return;
  }

  // Handle different states
  switch (state.step) {
    case 'awaiting_movie_name':
      await handleMovieName(chatId, text, state, userId, env);
      break;

    case 'awaiting_tv_name':
      await handleTVName(chatId, text, state, userId, env);
      break;

    case 'awaiting_cdn_url':
      state.cdnUrl = text;
      state.step = 'awaiting_facebook_id';
      await env.USER_STATES.put(userId, JSON.stringify(state));
      await sendMessage(chatId, '📺 Now send me the Facebook Video ID (or type "skip" to skip):', env);
      break;

    case 'awaiting_facebook_id':
      const fbId = text.toLowerCase() === 'skip' ? null : text;
      await finalizeContent(chatId, state, fbId, userId, env);
      break;

    case 'updating_movie_cdn':
      state.updatingMovieCdn = text;
      state.step = 'updating_movie_fbid';
      await env.USER_STATES.put(userId, JSON.stringify(state));
      await sendMessage(chatId, '📺 Now send me the new Facebook Video ID (or type "skip" to keep current):', env);
      break;

    case 'updating_movie_fbid':
      const newFbId = text.toLowerCase() === 'skip' ? null : text;
      await updateMovieContent(chatId, state, newFbId, userId, env);
      break;

    case 'updating_episode_cdn':
      state.updatingEpisodeCdn = text;
      state.step = 'updating_episode_fbid';
      await env.USER_STATES.put(userId, JSON.stringify(state));
      await sendMessage(chatId, '📺 Now send me the new Facebook Video ID (or type "skip" to keep current):', env);
      break;

    case 'updating_episode_fbid':
      const newEpFbId = text.toLowerCase() === 'skip' ? null : text;
      await updateEpisodeContent(chatId, state, newEpFbId, userId, env);
      break;

    case 'awaiting_new_episode_number':
      const episodeNum = parseInt(text);
      if (isNaN(episodeNum) || episodeNum < 1) {
        await sendMessage(chatId, '❌ Please enter a valid episode number (1, 2, 3...):', env);
        return;
      }
      state.addingEpisodeNumber = episodeNum;
      state.step = 'fetching_new_episode_details';
      await env.USER_STATES.put(userId, JSON.stringify(state));
      await fetchNewEpisodeDetails(chatId, state, userId, env);
      break;

    default:
      await sendMessage(chatId, 'Please use /start to begin', env);
  }
}

async function handleCallbackQuery(callbackQuery, env) {
  const chatId = callbackQuery.message.chat.id;
  const data = callbackQuery.data;
  const messageId = callbackQuery.message.message_id;
  const userId = `user_${chatId}`;

  // Answer callback query
  await fetch(`https://api.telegram.org/bot${env.TELEGRAM_TOKEN}/answerCallbackQuery`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ callback_query_id: callbackQuery.id })
  });

  const stateJSON = await env.USER_STATES.get(userId);
  const state = stateJSON ? JSON.parse(stateJSON) : { step: 'main_menu' };

  if (data === 'add_movie') {
    state.step = 'awaiting_movie_name';
    state.flow = 'add_movie';
    await env.USER_STATES.put(userId, JSON.stringify(state));
    await sendMessage(chatId, '🎬 Please send me the movie name:', env);
    await deleteMessage(chatId, messageId, env);
  }
  else if (data === 'add_tv') {
    state.step = 'awaiting_tv_name';
    state.flow = 'add_tv';
    await env.USER_STATES.put(userId, JSON.stringify(state));
    await sendMessage(chatId, '📺 Please send me the TV show name:', env);
    await deleteMessage(chatId, messageId, env);
  }
  else if (data === 'manage_content') {
    await showManageMenu(chatId, env);
    await deleteMessage(chatId, messageId, env);
  }
  else if (data === 'manage_movies') {
    await showMoviesList(chatId, userId, env);
    await deleteMessage(chatId, messageId, env);
  }
  else if (data === 'manage_tvshows') {
    await showTVShowsList(chatId, userId, env);
    await deleteMessage(chatId, messageId, env);
  }
  else if (data.startsWith('editmovie_')) {
    const movieId = data.replace('editmovie_', '');
    await showMovieOptions(chatId, movieId, userId, env);
    await deleteMessage(chatId, messageId, env);
  }
  else if (data.startsWith('updatemovie_')) {
    const movieId = data.replace('updatemovie_', '');
    const stateJSON = await env.USER_STATES.get(userId);
    const state = stateJSON ? JSON.parse(stateJSON) : {};
    state.step = 'updating_movie_cdn';
    state.updatingMovieId = movieId;
    await env.USER_STATES.put(userId, JSON.stringify(state));
    await sendMessage(chatId, '📝 Send me the new CDN URL:', env);
    await deleteMessage(chatId, messageId, env);
  }
  else if (data.startsWith('deletemovie_')) {
    const movieId = data.replace('deletemovie_', '');
    await confirmDeleteMovie(chatId, movieId, userId, env);
    await deleteMessage(chatId, messageId, env);
  }
  else if (data.startsWith('confirmdeletemovie_')) {
    const movieId = data.replace('confirmdeletemovie_', '');
    await deleteMovie(chatId, movieId, env);
    await deleteMessage(chatId, messageId, env);
  }
  else if (data.startsWith('edittvshow_')) {
    const showId = data.replace('edittvshow_', '');
    await showTVShowSeasons(chatId, showId, userId, env);
    await deleteMessage(chatId, messageId, env);
  }
  else if (data.startsWith('deletetvshow_')) {
    const showId = data.replace('deletetvshow_', '');
    await confirmDeleteTVShow(chatId, showId, userId, env);
    await deleteMessage(chatId, messageId, env);
  }
  else if (data.startsWith('confirmdeletetvshow_')) {
    const showId = data.replace('confirmdeletetvshow_', '');
    await deleteTVShow(chatId, showId, env);
    await deleteMessage(chatId, messageId, env);
  }
  else if (data.startsWith('addep_')) {
    const showId = data.replace('addep_', '');
    const stateJSON = await env.USER_STATES.get(userId);
    const state = stateJSON ? JSON.parse(stateJSON) : {};

    // Get show details
    const showUrl = `${env.SUPABASE_URL}/rest/v1/tv_shows?id=eq.${showId}&select=*`;
    const showResponse = await fetch(showUrl, {
      headers: {
        'apikey': env.SUPABASE_KEY,
        'Authorization': `Bearer ${env.SUPABASE_KEY}`
      }
    });
    const shows = await showResponse.json();
    state.addingEpisodeShow = shows[0];
    state.flow = 'add_episode';
    state.step = 'select_season_for_new_episode';
    await env.USER_STATES.put(userId, JSON.stringify(state));

    // Show season selection
    const numSeasons = parseInt(shows[0].seasons) || 1;
    const seasonButtons = [];
    for (let i = 1; i <= numSeasons; i++) {
      seasonButtons.push([{ text: `Season ${i}`, callback_data: `newep_season_${showId}_${i}` }]);
    }
    seasonButtons.push([{ text: '🔙 Cancel', callback_data: `edittvshow_${showId}` }]);

    const keyboard = { inline_keyboard: seasonButtons };
    await sendMessage(chatId, `📺 ${shows[0].title}\n\nWhich season is this episode for?`, env, keyboard);
    await deleteMessage(chatId, messageId, env);
  }
  else if (data.startsWith('newep_season_')) {
    const parts = data.replace('newep_season_', '').split('_');
    const showId = parts[0];
    const seasonNum = parseInt(parts[1]);

    const stateJSON = await env.USER_STATES.get(userId);
    const state = stateJSON ? JSON.parse(stateJSON) : {};
    state.addingEpisodeSeason = seasonNum;
    state.step = 'awaiting_new_episode_number';
    await env.USER_STATES.put(userId, JSON.stringify(state));

    await sendMessage(chatId, `📝 What is the episode number? (e.g., 1, 2, 3)`, env);
    await deleteMessage(chatId, messageId, env);
  }
  else if (data.startsWith('manageseason_')) {
    const [showId, seasonNum] = data.replace('manageseason_', '').split('_');
    await showSeasonEpisodes(chatId, showId, parseInt(seasonNum), userId, env);
    await deleteMessage(chatId, messageId, env);
  }
  else if (data.startsWith('editepisode_')) {
    const episodeId = data.replace('editepisode_', '');
    await showEpisodeOptions(chatId, episodeId, userId, env);
    await deleteMessage(chatId, messageId, env);
  }
  else if (data.startsWith('updateepisode_')) {
    const episodeId = data.replace('updateepisode_', '');
    const stateJSON = await env.USER_STATES.get(userId);
    const state = stateJSON ? JSON.parse(stateJSON) : {};
    state.step = 'updating_episode_cdn';
    state.updatingEpisodeId = episodeId;
    await env.USER_STATES.put(userId, JSON.stringify(state));
    await sendMessage(chatId, '📝 Send me the new CDN URL:', env);
    await deleteMessage(chatId, messageId, env);
  }
  else if (data.startsWith('deleteepisode_')) {
    const episodeId = data.replace('deleteepisode_', '');
    await confirmDeleteEpisode(chatId, episodeId, userId, env);
    await deleteMessage(chatId, messageId, env);
  }
  else if (data.startsWith('confirmdeleteepisode_')) {
    const episodeId = data.replace('confirmdeleteepisode_', '');
    await deleteEpisode(chatId, episodeId, env);
    await deleteMessage(chatId, messageId, env);
  }
  else if (data.startsWith('movie_')) {
    const tmdbId = data.replace('movie_', '');
    await handleMovieSelection(chatId, tmdbId, state, userId, env);
    await deleteMessage(chatId, messageId, env);
  }
  else if (data.startsWith('tv_')) {
    const tmdbId = data.replace('tv_', '');
    await handleTVSelection(chatId, tmdbId, state, userId, env);
    await deleteMessage(chatId, messageId, env);
  }
  else if (data.startsWith('season_')) {
    const seasonNum = parseInt(data.replace('season_', ''));
    await handleSeasonSelection(chatId, seasonNum, state, userId, env);
    await deleteMessage(chatId, messageId, env);
  }
  else if (data.startsWith('episode_')) {
    const episodeNum = parseInt(data.replace('episode_', ''));
    await handleEpisodeSelection(chatId, episodeNum, state, userId, env);
    await deleteMessage(chatId, messageId, env);
  }
  else if (data === 'back_main') {
    await showMainMenu(chatId, env);
    await deleteMessage(chatId, messageId, env);
  }
}

async function showMainMenu(chatId, env) {
  const keyboard = {
    inline_keyboard: [
      [{ text: '🎬 Add Movie', callback_data: 'add_movie' }],
      [{ text: '📺 Add TV Show', callback_data: 'add_tv' }],
      [{ text: '⚙️ Manage Content', callback_data: 'manage_content' }]
    ]
  };

  await sendMessage(chatId, '👋 Welcome! What would you like to do?', env, keyboard);
}

async function showManageMenu(chatId, env) {
  const keyboard = {
    inline_keyboard: [
      [{ text: '🎬 Manage Movies', callback_data: 'manage_movies' }],
      [{ text: '📺 Manage TV Shows', callback_data: 'manage_tvshows' }],
      [{ text: '🔙 Back to Main Menu', callback_data: 'back_main' }]
    ]
  };
  await sendMessage(chatId, '⚙️ What do you want to manage?', env, keyboard);
}

async function handleMovieName(chatId, movieName, state, userId, env) {
  await sendMessage(chatId, `🔍 Searching for "${movieName}"...`, env);

  // Search TMDB
  const searchUrl = `https://api.themoviedb.org/3/search/movie?api_key=${env.TMDB_API_KEY}&query=${encodeURIComponent(movieName)}`;
  const response = await fetch(searchUrl);
  const data = await response.json();

  if (!data.results || data.results.length === 0) {
    await sendMessage(chatId, '❌ No movies found. Please try another name:', env);
    return;
  }

  // Show top 10 results in one message with buttons
  const movies = data.results.slice(0, 10);
  state.searchResults = movies;
  await env.USER_STATES.put(userId, JSON.stringify(state));

  // Create buttons for all movies
  const buttons = movies.map(movie => {
    const year = movie.release_date?.split('-')[0] || 'N/A';
    const rating = movie.vote_average ? movie.vote_average.toFixed(1) : 'N/A';
    return [{
      text: `${movie.title} (${year}) ⭐${rating}`,
      callback_data: `movie_${movie.id}`
    }];
  });

  const keyboard = { inline_keyboard: buttons };
  await sendMessage(chatId, '🎬 Found these movies. Select one:', env, keyboard);
}

async function handleMovieSelection(chatId, tmdbId, state, userId, env) {
  await sendMessage(chatId, '⏳ Fetching movie details and translating...', env);

  // Get full movie details
  const detailsUrl = `https://api.themoviedb.org/3/movie/${tmdbId}?api_key=${env.TMDB_API_KEY}`;
  const response = await fetch(detailsUrl);
  const movie = await response.json();

  // Translate description to Sinhala and replace English description
  let translationStatus = '';
  if (movie.overview) {
    await sendMessage(chatId, '🔄 Translating description to Sinhala...', env);
    const translationResult = await translateToSinhala(movie.overview, env);

    if (translationResult.success) {
      movie.overview = translationResult.text; // Replace with Sinhala
      translationStatus = '✅ Description translated to Sinhala';
    } else {
      // Keep English description as fallback
      translationStatus = '⚠️ Translation failed, using English description';
      console.error('Translation failed for movie:', movie.title, translationResult.error);
    }
  } else {
    translationStatus = 'ℹ️ No description available';
  }

  state.selectedMovie = movie;
  state.step = 'awaiting_cdn_url';
  await env.USER_STATES.put(userId, JSON.stringify(state));

  const info = `✅ Selected: ${movie.title}\n${translationStatus}\n\n📝 Now send me the CDN URL:`;
  await sendMessage(chatId, info, env);
}

async function handleTVName(chatId, tvName, state, userId, env) {
  await sendMessage(chatId, `🔍 Searching for "${tvName}"...`, env);

  const searchUrl = `https://api.themoviedb.org/3/search/tv?api_key=${env.TMDB_API_KEY}&query=${encodeURIComponent(tvName)}`;
  const response = await fetch(searchUrl);
  const data = await response.json();

  if (!data.results || data.results.length === 0) {
    await sendMessage(chatId, '❌ No TV shows found. Please try another name:', env);
    return;
  }

  const shows = data.results.slice(0, 10);
  state.searchResults = shows;
  await env.USER_STATES.put(userId, JSON.stringify(state));

  // Create buttons for all TV shows
  const buttons = shows.map(show => {
    const year = show.first_air_date?.split('-')[0] || 'N/A';
    const rating = show.vote_average ? show.vote_average.toFixed(1) : 'N/A';
    return [{
      text: `${show.name} (${year}) ⭐${rating}`,
      callback_data: `tv_${show.id}`
    }];
  });

  const keyboard = { inline_keyboard: buttons };
  await sendMessage(chatId, '📺 Found these TV shows. Select one:', env, keyboard);
}

async function handleTVSelection(chatId, tmdbId, state, userId, env) {
  await sendMessage(chatId, '⏳ Fetching TV show details and translating...', env);

  const detailsUrl = `https://api.themoviedb.org/3/tv/${tmdbId}?api_key=${env.TMDB_API_KEY}`;
  const response = await fetch(detailsUrl);
  const show = await response.json();

  // Translate description to Sinhala and replace English description
  let translationStatus = '';
  if (show.overview) {
    await sendMessage(chatId, '🔄 Translating description to Sinhala...', env);
    const translationResult = await translateToSinhala(show.overview, env);

    if (translationResult.success) {
      show.overview = translationResult.text; // Replace with Sinhala
      translationStatus = '✅ Description translated to Sinhala';
    } else {
      // Keep English description as fallback
      translationStatus = '⚠️ Translation failed, using English description';
      console.error('Translation failed for TV show:', show.name, translationResult.error);
    }
  } else {
    translationStatus = 'ℹ️ No description available';
  }

  state.selectedShow = show;
  state.step = 'awaiting_season';
  await env.USER_STATES.put(userId, JSON.stringify(state));

  // Show season buttons
  const buttons = [];
  for (let i = 1; i <= show.number_of_seasons; i++) {
    buttons.push([{ text: `Season ${i}`, callback_data: `season_${i}` }]);
  }

  const keyboard = { inline_keyboard: buttons };
  await sendMessage(chatId, `✅ Selected: ${show.name}\n${translationStatus}\n\n📺 Which season?`, env, keyboard);
}

async function handleSeasonSelection(chatId, seasonNum, state, userId, env) {
  state.selectedSeason = seasonNum;
  state.step = 'awaiting_episode';

  // Fetch season details to get episode count
  const seasonUrl = `https://api.themoviedb.org/3/tv/${state.selectedShow.id}/season/${seasonNum}?api_key=${env.TMDB_API_KEY}`;
  const response = await fetch(seasonUrl);
  const seasonData = await response.json();

  await env.USER_STATES.put(userId, JSON.stringify(state));

  // Show episode buttons (max 10 per row)
  const buttons = [];
  for (let i = 1; i <= seasonData.episodes.length; i++) {
    buttons.push([{ text: `Episode ${i}`, callback_data: `episode_${i}` }]);
  }

  const keyboard = { inline_keyboard: buttons };
  await sendMessage(chatId, `📺 Season ${seasonNum} - Which episode?`, env, keyboard);
}

async function handleEpisodeSelection(chatId, episodeNum, state, userId, env) {
  await sendMessage(chatId, '⏳ Fetching episode details and translating...', env);

  const episodeUrl = `https://api.themoviedb.org/3/tv/${state.selectedShow.id}/season/${state.selectedSeason}/episode/${episodeNum}?api_key=${env.TMDB_API_KEY}`;
  const response = await fetch(episodeUrl);
  const episode = await response.json();

  // Translate episode description to Sinhala and replace English description
  let translationStatus = '';
  if (episode.overview) {
    await sendMessage(chatId, '🔄 Translating episode description to Sinhala...', env);
    const translationResult = await translateToSinhala(episode.overview, env);

    if (translationResult.success) {
      episode.overview = translationResult.text; // Replace with Sinhala
      translationStatus = '✅ Description translated to Sinhala';
    } else {
      // Keep English description as fallback
      translationStatus = '⚠️ Translation failed, using English description';
      console.error('Translation failed for episode:', episode.name, translationResult.error);
    }
  } else {
    translationStatus = 'ℹ️ No description available';
  }

  state.selectedEpisode = episode;
  state.step = 'awaiting_cdn_url';
  await env.USER_STATES.put(userId, JSON.stringify(state));

  const info = `✅ Selected: ${episode.name}\nSeason ${state.selectedSeason}, Episode ${episodeNum}\n${translationStatus}\n\n📝 Now send me the CDN URL:`;
  await sendMessage(chatId, info, env);
}

async function finalizeContent(chatId, state, fbId, userId, env) {
  await sendMessage(chatId, '⏳ Saving to database...', env);

  try {
    if (state.flow === 'add_movie') {
      await saveMovie(state, fbId, env);
      await sendMessage(chatId, `✅ Movie "${state.selectedMovie.title}" added successfully!\n\nUse /start for main menu`, env);
    } else if (state.flow === 'add_tv') {
      await saveEpisode(state, fbId, env);
      await sendMessage(chatId, `✅ Episode added successfully!\n${state.selectedShow.name} - S${state.selectedSeason}E${state.selectedEpisode.episode_number}\n\nUse /start for main menu`, env);
    } else if (state.flow === 'add_episode') {
      await saveNewEpisode(state, fbId, env);
      await sendMessage(chatId, `✅ Episode added successfully!\n${state.addingEpisodeShow.title} - S${state.addingEpisodeSeason}E${state.addingEpisodeNumber}\n\nUse /start for main menu`, env);
    }

    // Reset state
    state.step = 'main_menu';
    await env.USER_STATES.put(userId, JSON.stringify(state));

  } catch (error) {
    await sendMessage(chatId, `❌ Error saving to database: ${error.message}`, env);
  }
}

async function saveMovie(state, fbId, env) {
  const movie = state.selectedMovie;

  const movieData = {
    tmdbId: movie.id,
    title: movie.title,
    description: movie.overview, // Now contains Sinhala translation
    platform: 'NETFLIX',
    year: movie.release_date?.split('-')[0] || null,
    rating: movie.vote_average?.toString() || null,
    genres: movie.genres?.map(g => g.name) || [],
    backdrop: movie.backdrop_path ? `https://image.tmdb.org/t/p/original${movie.backdrop_path}` : null,
    poster: movie.poster_path ? `https://image.tmdb.org/t/p/w500${movie.poster_path}` : null,
    ageRating: 'PG-13',
    runtime: movie.runtime ? `${movie.runtime} min` : null,
    videoUrl: state.cdnUrl,
    facebookVideoId: fbId
  };

  // Check if movie exists
  const checkUrl = `${env.SUPABASE_URL}/rest/v1/movies?tmdbId=eq.${movie.id}&select=id`;
  const checkResponse = await fetch(checkUrl, {
    headers: {
      'apikey': env.SUPABASE_KEY,
      'Authorization': `Bearer ${env.SUPABASE_KEY}`
    }
  });
  const existing = await checkResponse.json();

  if (existing && existing.length > 0) {
    // Update existing
    const updateUrl = `${env.SUPABASE_URL}/rest/v1/movies?id=eq.${existing[0].id}`;
    await fetch(updateUrl, {
      method: 'PATCH',
      headers: {
        'apikey': env.SUPABASE_KEY,
        'Authorization': `Bearer ${env.SUPABASE_KEY}`,
        'Content-Type': 'application/json',
        'Prefer': 'return=minimal'
      },
      body: JSON.stringify(movieData)
    });
  } else {
    // Insert new
    const insertUrl = `${env.SUPABASE_URL}/rest/v1/movies`;
    await fetch(insertUrl, {
      method: 'POST',
      headers: {
        'apikey': env.SUPABASE_KEY,
        'Authorization': `Bearer ${env.SUPABASE_KEY}`,
        'Content-Type': 'application/json',
        'Prefer': 'return=minimal'
      },
      body: JSON.stringify(movieData)
    });
  }
}

async function saveNewEpisode(state, fbId, env) {
  const show = state.addingEpisodeShow;
  const episode = state.newEpisodeDetails;
  const seasonNum = state.addingEpisodeSeason;
  const episodeNum = state.addingEpisodeNumber;

  const episodeData = {
    tv_show_id: show.id,
    season_number: seasonNum,
    episode_number: episodeNum,
    title: episode.name,
    description: episode.overview, // Now contains Sinhala translation
    thumbnail: episode.still_path ? `https://image.tmdb.org/t/p/w500${episode.still_path}` : null,
    video_url: state.cdnUrl,
    facebook_video_id: fbId
  };

  // Check if episode already exists
  const checkEpUrl = `${env.SUPABASE_URL}/rest/v1/episodes?tv_show_id=eq.${show.id}&season_number=eq.${seasonNum}&episode_number=eq.${episodeNum}&select=id`;
  const checkEpResponse = await fetch(checkEpUrl, {
    headers: {
      'apikey': env.SUPABASE_KEY,
      'Authorization': `Bearer ${env.SUPABASE_KEY}`
    }
  });
  const existingEp = await checkEpResponse.json();

  if (existingEp && existingEp.length > 0) {
    // Update existing episode
    const updateUrl = `${env.SUPABASE_URL}/rest/v1/episodes?id=eq.${existingEp[0].id}`;
    await fetch(updateUrl, {
      method: 'PATCH',
      headers: {
        'apikey': env.SUPABASE_KEY,
        'Authorization': `Bearer ${env.SUPABASE_KEY}`,
        'Content-Type': 'application/json',
        'Prefer': 'return=minimal'
      },
      body: JSON.stringify(episodeData)
    });
  } else {
    // Insert new episode
    const insertUrl = `${env.SUPABASE_URL}/rest/v1/episodes`;
    await fetch(insertUrl, {
      method: 'POST',
      headers: {
        'apikey': env.SUPABASE_KEY,
        'Authorization': `Bearer ${env.SUPABASE_KEY}`,
        'Content-Type': 'application/json',
        'Prefer': 'return=minimal'
      },
      body: JSON.stringify(episodeData)
    });
  }
}

async function saveEpisode(state, fbId, env) {
  const show = state.selectedShow;
  const episode = state.selectedEpisode;

  // First, ensure TV show exists in tv_shows table
  const showData = {
    tmdbId: show.id,
    title: show.name,
    description: show.overview, // Now contains Sinhala translation
    platform: 'NETFLIX',
    year: show.first_air_date?.split('-')[0] || null,
    rating: show.vote_average?.toString() || null,
    genres: show.genres?.map(g => g.name) || [],
    backdrop: show.backdrop_path ? `https://image.tmdb.org/t/p/original${show.backdrop_path}` : null,
    poster: show.poster_path ? `https://image.tmdb.org/t/p/w500${show.poster_path}` : null,
    ageRating: 'PG-13',
    seasons: show.number_of_seasons?.toString() || '1',
    videoUrl: ''
  };

  // Check if show exists
  const checkShowUrl = `${env.SUPABASE_URL}/rest/v1/tv_shows?tmdbId=eq.${show.id}&select=id`;
  const checkShowResponse = await fetch(checkShowUrl, {
    headers: {
      'apikey': env.SUPABASE_KEY,
      'Authorization': `Bearer ${env.SUPABASE_KEY}`
    }
  });
  const existingShow = await checkShowResponse.json();

  let tvShowId;

  if (existingShow && existingShow.length > 0) {
    tvShowId = existingShow[0].id;
  } else {
    // Insert show
    const insertShowUrl = `${env.SUPABASE_URL}/rest/v1/tv_shows`;
    const insertShowResponse = await fetch(insertShowUrl, {
      method: 'POST',
      headers: {
        'apikey': env.SUPABASE_KEY,
        'Authorization': `Bearer ${env.SUPABASE_KEY}`,
        'Content-Type': 'application/json',
        'Prefer': 'return=representation'
      },
      body: JSON.stringify(showData)
    });
    const newShow = await insertShowResponse.json();
    tvShowId = newShow[0].id;
  }

  // Now insert/update episode
  const episodeData = {
    tv_show_id: tvShowId,
    season_number: state.selectedSeason,
    episode_number: episode.episode_number,
    title: episode.name,
    description: episode.overview, // Now contains Sinhala translation
    thumbnail: episode.still_path ? `https://image.tmdb.org/t/p/w500${episode.still_path}` : null,
    video_url: state.cdnUrl,
    facebook_video_id: fbId
  };

  // Check if episode exists
  const checkEpUrl = `${env.SUPABASE_URL}/rest/v1/episodes?tv_show_id=eq.${tvShowId}&season_number=eq.${state.selectedSeason}&episode_number=eq.${episode.episode_number}&select=id`;
  const checkEpResponse = await fetch(checkEpUrl, {
    headers: {
      'apikey': env.SUPABASE_KEY,
      'Authorization': `Bearer ${env.SUPABASE_KEY}`
    }
  });
  const existingEp = await checkEpResponse.json();

  if (existingEp && existingEp.length > 0) {
    // Update
    const updateUrl = `${env.SUPABASE_URL}/rest/v1/episodes?id=eq.${existingEp[0].id}`;
    await fetch(updateUrl, {
      method: 'PATCH',
      headers: {
        'apikey': env.SUPABASE_KEY,
        'Authorization': `Bearer ${env.SUPABASE_KEY}`,
        'Content-Type': 'application/json',
        'Prefer': 'return=minimal'
      },
      body: JSON.stringify(episodeData)
    });
  } else {
    // Insert
    const insertUrl = `${env.SUPABASE_URL}/rest/v1/episodes`;
    await fetch(insertUrl, {
      method: 'POST',
      headers: {
        'apikey': env.SUPABASE_KEY,
        'Authorization': `Bearer ${env.SUPABASE_KEY}`,
        'Content-Type': 'application/json',
        'Prefer': 'return=minimal'
      },
      body: JSON.stringify(episodeData)
    });
  }
}

async function sendMessage(chatId, text, env, replyMarkup = null) {
  const payload = {
    chat_id: chatId,
    text: text,
    parse_mode: 'HTML'
  };

  if (replyMarkup) {
    payload.reply_markup = replyMarkup;
  }

  await fetch(`https://api.telegram.org/bot${env.TELEGRAM_TOKEN}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
}

async function sendPhoto(chatId, photoUrl, caption, env, replyMarkup = null) {
  const payload = {
    chat_id: chatId,
    photo: photoUrl,
    caption: caption
  };

  if (replyMarkup) {
    payload.reply_markup = replyMarkup;
  }

  await fetch(`https://api.telegram.org/bot${env.TELEGRAM_TOKEN}/sendPhoto`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
}

async function deleteMessage(chatId, messageId, env) {
  await fetch(`https://api.telegram.org/bot${env.TELEGRAM_TOKEN}/deleteMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      chat_id: chatId,
      message_id: messageId
    })
  });
}

// Manage Movies Functions
async function showMoviesList(chatId, userId, env) {
  await sendMessage(chatId, '⏳ Loading movies...', env);

  const listUrl = `${env.SUPABASE_URL}/rest/v1/movies?select=id,title,year&order=title.asc`;
  const response = await fetch(listUrl, {
    headers: {
      'apikey': env.SUPABASE_KEY,
      'Authorization': `Bearer ${env.SUPABASE_KEY}`
    }
  });

  const movies = await response.json();

  if (!movies || movies.length === 0) {
    await sendMessage(chatId, '❌ No movies found in database.', env);
    return;
  }

  const buttons = movies.map(movie => [{
    text: `${movie.title} (${movie.year || 'N/A'})`,
    callback_data: `editmovie_${movie.id}`
  }]);

  buttons.push([{ text: '🔙 Back', callback_data: 'manage_content' }]);

  const keyboard = { inline_keyboard: buttons };
  await sendMessage(chatId, '🎬 Select a movie to manage:', env, keyboard);
}

async function showMovieOptions(chatId, movieId, userId, env) {
  const movieUrl = `${env.SUPABASE_URL}/rest/v1/movies?id=eq.${movieId}&select=*`;
  const response = await fetch(movieUrl, {
    headers: {
      'apikey': env.SUPABASE_KEY,
      'Authorization': `Bearer ${env.SUPABASE_KEY}`
    }
  });

  const movies = await response.json();
  const movie = movies[0];

  const info = `🎬 ${movie.title} (${movie.year})\n⭐ ${movie.rating}/10\n\n📺 CDN: ${movie.videoUrl ? 'Set' : 'Not set'}\n🆔 FB ID: ${movie.facebookVideoId || 'Not set'}`;

  const keyboard = {
    inline_keyboard: [
      [{ text: '✏️ Update URLs', callback_data: `updatemovie_${movieId}` }],
      [{ text: '🗑️ Delete Movie', callback_data: `deletemovie_${movieId}` }],
      [{ text: '🔙 Back to List', callback_data: 'manage_movies' }]
    ]
  };

  await sendMessage(chatId, info, env, keyboard);
}

async function confirmDeleteMovie(chatId, movieId, userId, env) {
  const keyboard = {
    inline_keyboard: [
      [{ text: '✅ Yes, Delete', callback_data: `confirmdeletemovie_${movieId}` }],
      [{ text: '❌ Cancel', callback_data: `editmovie_${movieId}` }]
    ]
  };

  await sendMessage(chatId, '⚠️ Are you sure you want to delete this movie?', env, keyboard);
}

async function deleteMovie(chatId, movieId, env) {
  const deleteUrl = `${env.SUPABASE_URL}/rest/v1/movies?id=eq.${movieId}`;
  await fetch(deleteUrl, {
    method: 'DELETE',
    headers: {
      'apikey': env.SUPABASE_KEY,
      'Authorization': `Bearer ${env.SUPABASE_KEY}`
    }
  });

  await sendMessage(chatId, '✅ Movie deleted successfully!', env);
  await showMoviesList(chatId, `user_${chatId}`, env);
}

// Manage TV Shows Functions
async function showTVShowsList(chatId, userId, env) {
  await sendMessage(chatId, '⏳ Loading TV shows...', env);

  const listUrl = `${env.SUPABASE_URL}/rest/v1/tv_shows?select=id,title,year&order=title.asc`;
  const response = await fetch(listUrl, {
    headers: {
      'apikey': env.SUPABASE_KEY,
      'Authorization': `Bearer ${env.SUPABASE_KEY}`
    }
  });

  const shows = await response.json();

  if (!shows || shows.length === 0) {
    await sendMessage(chatId, '❌ No TV shows found in database.', env);
    return;
  }

  const buttons = shows.map(show => [{
    text: `${show.title} (${show.year || 'N/A'})`,
    callback_data: `edittvshow_${show.id}`
  }]);

  buttons.push([{ text: '🔙 Back', callback_data: 'manage_content' }]);

  const keyboard = { inline_keyboard: buttons };
  await sendMessage(chatId, '📺 Select a TV show to manage:', env, keyboard);
}

async function showTVShowSeasons(chatId, showId, userId, env) {
  const showUrl = `${env.SUPABASE_URL}/rest/v1/tv_shows?id=eq.${showId}&select=*`;
  const response = await fetch(showUrl, {
    headers: {
      'apikey': env.SUPABASE_KEY,
      'Authorization': `Bearer ${env.SUPABASE_KEY}`
    }
  });

  const shows = await response.json();
  const show = shows[0];

  const numSeasons = parseInt(show.seasons) || 1;

  const buttons = [];
  for (let i = 1; i <= numSeasons; i++) {
    buttons.push([{ text: `Season ${i}`, callback_data: `manageseason_${showId}_${i}` }]);
  }

  buttons.push([{ text: '➕ Add New Episode', callback_data: `addep_${showId}` }]);
  buttons.push([{ text: '🗑️ Delete Entire Show', callback_data: `deletetvshow_${showId}` }]);
  buttons.push([{ text: '🔙 Back to List', callback_data: 'manage_tvshows' }]);

  const keyboard = { inline_keyboard: buttons };
  await sendMessage(chatId, `📺 ${show.title}\n\nSelect a season to manage:`, env, keyboard);
}

async function showSeasonEpisodes(chatId, showId, seasonNum, userId, env) {
  await sendMessage(chatId, '⏳ Loading episodes...', env);

  const episodesUrl = `${env.SUPABASE_URL}/rest/v1/episodes?tv_show_id=eq.${showId}&season_number=eq.${seasonNum}&select=*&order=episode_number.asc`;
  const response = await fetch(episodesUrl, {
    headers: {
      'apikey': env.SUPABASE_KEY,
      'Authorization': `Bearer ${env.SUPABASE_KEY}`
    }
  });

  const episodes = await response.json();

  if (!episodes || episodes.length === 0) {
    const keyboard = {
      inline_keyboard: [
        [{ text: '➕ Add First Episode', callback_data: `addep_${showId}` }],
        [{ text: '🔙 Back to Seasons', callback_data: `edittvshow_${showId}` }]
      ]
    };
    await sendMessage(chatId, `❌ No episodes found for Season ${seasonNum}.\n\nWould you like to add one?`, env, keyboard);
    return;
  }

  const buttons = episodes.map(ep => [{
    text: `E${ep.episode_number}: ${ep.title}`,
    callback_data: `editepisode_${ep.id}`
  }]);

  buttons.push([{ text: '➕ Add Another Episode', callback_data: `addep_${showId}` }]);
  buttons.push([{ text: '🔙 Back to Seasons', callback_data: `edittvshow_${showId}` }]);

  const keyboard = { inline_keyboard: buttons };
  await sendMessage(chatId, `📺 Season ${seasonNum} Episodes (${episodes.length} total):`, env, keyboard);
}

async function showEpisodeOptions(chatId, episodeId, userId, env) {
  const episodeUrl = `${env.SUPABASE_URL}/rest/v1/episodes?id=eq.${episodeId}&select=*`;
  const response = await fetch(episodeUrl, {
    headers: {
      'apikey': env.SUPABASE_KEY,
      'Authorization': `Bearer ${env.SUPABASE_KEY}`
    }
  });

  const episodes = await response.json();
  const episode = episodes[0];

  const info = `📺 ${episode.title}\nS${episode.season_number}E${episode.episode_number}\n\n📺 CDN: ${episode.video_url ? 'Set' : 'Not set'}\n🆔 FB ID: ${episode.facebook_video_id || 'Not set'}`;

  const keyboard = {
    inline_keyboard: [
      [{ text: '✏️ Update URLs', callback_data: `updateepisode_${episodeId}` }],
      [{ text: '🗑️ Delete Episode', callback_data: `deleteepisode_${episodeId}` }],
      [{ text: '🔙 Back to Episodes', callback_data: `manageseason_${episode.tv_show_id}_${episode.season_number}` }]
    ]
  };

  await sendMessage(chatId, info, env, keyboard);
}

async function confirmDeleteEpisode(chatId, episodeId, userId, env) {
  const keyboard = {
    inline_keyboard: [
      [{ text: '✅ Yes, Delete', callback_data: `confirmdeleteepisode_${episodeId}` }],
      [{ text: '❌ Cancel', callback_data: `editepisode_${episodeId}` }]
    ]
  };

  await sendMessage(chatId, '⚠️ Are you sure you want to delete this episode?', env, keyboard);
}

async function deleteEpisode(chatId, episodeId, env) {
  // Get episode info first for back navigation
  const episodeUrl = `${env.SUPABASE_URL}/rest/v1/episodes?id=eq.${episodeId}&select=tv_show_id,season_number`;
  const response = await fetch(episodeUrl, {
    headers: {
      'apikey': env.SUPABASE_KEY,
      'Authorization': `Bearer ${env.SUPABASE_KEY}`
    }
  });
  const episodes = await response.json();
  const episode = episodes[0];

  const deleteUrl = `${env.SUPABASE_URL}/rest/v1/episodes?id=eq.${episodeId}`;
  await fetch(deleteUrl, {
    method: 'DELETE',
    headers: {
      'apikey': env.SUPABASE_KEY,
      'Authorization': `Bearer ${env.SUPABASE_KEY}`
    }
  });

  await sendMessage(chatId, '✅ Episode deleted successfully!', env);
  await showSeasonEpisodes(chatId, episode.tv_show_id, episode.season_number, `user_${chatId}`, env);
}

async function confirmDeleteTVShow(chatId, showId, userId, env) {
  const keyboard = {
    inline_keyboard: [
      [{ text: '✅ Yes, Delete Everything', callback_data: `confirmdeletetvshow_${showId}` }],
      [{ text: '❌ Cancel', callback_data: `edittvshow_${showId}` }]
    ]
  };

  await sendMessage(chatId, '⚠️ This will delete the show and ALL its episodes! Are you sure?', env, keyboard);
}

async function deleteTVShow(chatId, showId, env) {
  // Delete all episodes first
  const deleteEpisodesUrl = `${env.SUPABASE_URL}/rest/v1/episodes?tv_show_id=eq.${showId}`;
  await fetch(deleteEpisodesUrl, {
    method: 'DELETE',
    headers: {
      'apikey': env.SUPABASE_KEY,
      'Authorization': `Bearer ${env.SUPABASE_KEY}`
    }
  });

  // Delete the show
  const deleteShowUrl = `${env.SUPABASE_URL}/rest/v1/tv_shows?id=eq.${showId}`;
  await fetch(deleteShowUrl, {
    method: 'DELETE',
    headers: {
      'apikey': env.SUPABASE_KEY,
      'Authorization': `Bearer ${env.SUPABASE_KEY}`
    }
  });

  await sendMessage(chatId, '✅ TV show and all episodes deleted successfully!', env);
  await showTVShowsList(chatId, `user_${chatId}`, env);
}

// Update Movie Function
async function updateMovieContent(chatId, state, fbId, userId, env) {
  await sendMessage(chatId, '⏳ Updating movie...', env);

  const updateData = {
    videoUrl: state.updatingMovieCdn
  };

  if (fbId !== null) {
    updateData.facebookVideoId = fbId;
  }

  const updateUrl = `${env.SUPABASE_URL}/rest/v1/movies?id=eq.${state.updatingMovieId}`;
  await fetch(updateUrl, {
    method: 'PATCH',
    headers: {
      'apikey': env.SUPABASE_KEY,
      'Authorization': `Bearer ${env.SUPABASE_KEY}`,
      'Content-Type': 'application/json',
      'Prefer': 'return=minimal'
    },
    body: JSON.stringify(updateData)
  });

  await sendMessage(chatId, '✅ Movie updated successfully!\n\nUse /start for main menu', env);

  // Reset state
  state.step = 'main_menu';
  await env.USER_STATES.put(userId, JSON.stringify(state));
}

// Fetch new episode details from TMDB
async function fetchNewEpisodeDetails(chatId, state, userId, env) {
  await sendMessage(chatId, '⏳ Fetching episode details from TMDB and translating...', env);

  const show = state.addingEpisodeShow;
  const seasonNum = state.addingEpisodeSeason;
  const episodeNum = state.addingEpisodeNumber;

  const episodeUrl = `https://api.themoviedb.org/3/tv/${show.tmdbId}/season/${seasonNum}/episode/${episodeNum}?api_key=${env.TMDB_API_KEY}`;

  try {
    const response = await fetch(episodeUrl);
    const episode = await response.json();

    if (episode.success === false) {
      await sendMessage(chatId, `❌ Episode not found on TMDB. Please check the episode number.\n\nUse /start to go back`, env);
      state.step = 'main_menu';
      await env.USER_STATES.put(userId, JSON.stringify(state));
      return;
    }

    // Translate episode description to Sinhala and replace English description
    let translationStatus = '';
    if (episode.overview) {
      await sendMessage(chatId, '🔄 Translating episode description to Sinhala...', env);
      const translationResult = await translateToSinhala(episode.overview, env);

      if (translationResult.success) {
        episode.overview = translationResult.text; // Replace with Sinhala
        translationStatus = '✅ Description translated to Sinhala';
      } else {
        // Keep English description as fallback
        translationStatus = '⚠️ Translation failed, using English description';
        console.error('Translation failed for episode:', episode.name, translationResult.error);
      }
    } else {
      translationStatus = 'ℹ️ No description available';
    }

    state.newEpisodeDetails = episode;
    state.step = 'awaiting_cdn_url';
    await env.USER_STATES.put(userId, JSON.stringify(state));

    const info = `✅ Found episode:\n📺 ${episode.name}\nS${seasonNum}E${episodeNum}\n${translationStatus}\n\n📝 Now send me the CDN URL:`;
    await sendMessage(chatId, info, env);

  } catch (error) {
    await sendMessage(chatId, `❌ Error fetching episode details. Please try again.\n\nUse /start to go back`, env);
    state.step = 'main_menu';
    await env.USER_STATES.put(userId, JSON.stringify(state));
  }
}

// Update Episode Function
async function updateEpisodeContent(chatId, state, fbId, userId, env) {
  await sendMessage(chatId, '⏳ Updating episode...', env);

  const updateData = {
    video_url: state.updatingEpisodeCdn
  };

  if (fbId !== null) {
    updateData.facebook_video_id = fbId;
  }

  const updateUrl = `${env.SUPABASE_URL}/rest/v1/episodes?id=eq.${state.updatingEpisodeId}`;
  await fetch(updateUrl, {
    method: 'PATCH',
    headers: {
      'apikey': env.SUPABASE_KEY,
      'Authorization': `Bearer ${env.SUPABASE_KEY}`,
      'Content-Type': 'application/json',
      'Prefer': 'return=minimal'
    },
    body: JSON.stringify(updateData)
  });

  await sendMessage(chatId, '✅ Episode updated successfully!\n\nUse /start for main menu', env);

  // Reset state
  state.step = 'main_menu';
  await env.USER_STATES.put(userId, JSON.stringify(state));
}
