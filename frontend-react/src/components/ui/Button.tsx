import { motion, type HTMLMotionProps } from 'framer-motion'
import { Loader2 } from 'lucide-react'

interface ButtonProps extends Omit<HTMLMotionProps<'button'>, 'children'> {
    variant?: 'primary' | 'secondary' | 'ghost' | 'outline'
    size?: 'sm' | 'md' | 'lg'
    isLoading?: boolean
    icon?: React.ReactNode
    children: React.ReactNode
}

export function Button({
    variant = 'primary',
    size = 'md',
    isLoading = false,
    icon,
    children,
    className = '',
    ...props
}: ButtonProps) {
    const baseStyles =
        'inline-flex items-center justify-center rounded-lg font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-primary/50 disabled:opacity-50 disabled:cursor-not-allowed'

    const variants = {
        primary:
            'bg-primary text-white hover:bg-primary-hover shadow-[0_0_20px_-5px_rgba(99,102,241,0.4)] border border-transparent',
        secondary:
            'bg-surface-highlight text-white hover:bg-[#2a2a2a] border border-border',
        outline: 'bg-transparent text-white border border-border hover:bg-white/5',
        ghost: 'bg-transparent text-secondary hover:text-white hover:bg-white/5',
    }

    const sizes = {
        sm: 'h-8 px-3 text-xs',
        md: 'h-10 px-4 text-sm',
        lg: 'h-12 px-6 text-base',
    }

    return (
        <motion.button
            whileTap={{
                scale: 0.98,
            }}
            className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
            disabled={isLoading}
            {...props}
        >
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {!isLoading && icon && <span className="mr-2">{icon}</span>}
            {children}
        </motion.button>
    )
}
