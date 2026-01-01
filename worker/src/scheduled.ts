import { Context } from 'hono';
import { cleanup } from './common'
import { CONSTANTS } from './constants'
import { getJsonSetting } from './utils';
import { CleanupSettings } from './models';
import { executeCustomSqlCleanup } from './admin_api/cleanup_api';

export async function scheduled(event: ScheduledEvent, env: Bindings, ctx: any) {
    console.log("Scheduled event: ", event);

    // Keep Render Pusher awake
    if (env.PUSHER_URL) {
        try {
            await fetch(`${env.PUSHER_URL}/ping`);
            console.log("Render Pusher pinged successfully");
        } catch (error) {
            console.error("Render Pusher ping failed", error);
        }
    }
    const autoCleanupSetting = await getJsonSetting<CleanupSettings>(
        { env: env, } as Context<HonoCustomType>,
        CONSTANTS.AUTO_CLEANUP_KEY
    );

    // Mandatory 24-hour cleanup fallback
    // This ensures that even if settings are not configured, data is wiped after 24 hours.
    const defaultCleanDays = 1;

    // 1. Cleanup Mails
    await cleanup(
        { env: env, } as Context<HonoCustomType>,
        "mails",
        (autoCleanupSetting?.enableMailsAutoCleanup) ? autoCleanupSetting.cleanMailsDays : defaultCleanDays
    );

    // 2. Cleanup Unknown Mails
    await cleanup(
        { env: env, } as Context<HonoCustomType>,
        "mails_unknow",
        (autoCleanupSetting?.enableUnknowMailsAutoCleanup) ? autoCleanupSetting.cleanUnknowMailsDays : defaultCleanDays
    );

    // 3. Cleanup Sendbox
    await cleanup(
        { env: env, } as Context<HonoCustomType>,
        "sendbox",
        (autoCleanupSetting?.enableSendBoxAutoCleanup) ? autoCleanupSetting.cleanSendBoxDays : defaultCleanDays
    );

    // 4. Cleanup Address (Created at) - This ensures the email becomes "expired" and unusable
    await cleanup(
        { env: env, } as Context<HonoCustomType>,
        "addressCreated",
        (autoCleanupSetting?.enableAddressAutoCleanup) ? autoCleanupSetting.cleanAddressDays : defaultCleanDays
    );

    // If we have settings, process the rest of them
    if (autoCleanupSetting) {
        if (autoCleanupSetting.enableInactiveAddressAutoCleanup) {
            await cleanup(
                { env: env, } as Context<HonoCustomType>,
                "inactiveAddress",
                autoCleanupSetting.cleanInactiveAddressDays
            );
        }
        if (autoCleanupSetting.enableUnboundAddressAutoCleanup) {
            await cleanup(
                { env: env, } as Context<HonoCustomType>,
                "unboundAddress",
                autoCleanupSetting.cleanUnboundAddressDays
            );
        }
        if (autoCleanupSetting.enableEmptyAddressAutoCleanup) {
            await cleanup(
                { env: env, } as Context<HonoCustomType>,
                "emptyAddress",
                autoCleanupSetting.cleanEmptyAddressDays
            );
        }
        // Execute custom SQL cleanup tasks
        if (autoCleanupSetting.customSqlCleanupList && autoCleanupSetting.customSqlCleanupList.length > 0) {
            for (const customSql of autoCleanupSetting.customSqlCleanupList) {
                if (customSql.enabled && customSql.sql) {
                    const result = await executeCustomSqlCleanup(
                        { env: env, } as Context<HonoCustomType>,
                        customSql
                    );
                    if (!result.success) {
                        console.error(`Custom SQL cleanup [${customSql.name}] failed: ${result.error}`);
                    }
                }
            }
        }
    }
}
