import { motion, AnimatePresence } from 'framer-motion'
import { X, Download, QrCode } from 'lucide-react'
import { QRCodeSVG } from 'qrcode.react'
import { useRef } from 'react'
import { Button } from './Button'

interface QRCodeModalProps {
    email: string
    isOpen: boolean
    onClose: () => void
}

export function QRCodeModal({ email, isOpen, onClose }: QRCodeModalProps) {
    const svgRef = useRef<SVGSVGElement>(null)

    const downloadQRCode = () => {
        if (!svgRef.current) return

        const svgData = new XMLSerializer().serializeToString(svgRef.current)
        const canvas = document.createElement('canvas')
        const ctx = canvas.getContext('2d')
        const img = new Image()

        img.onload = () => {
            canvas.width = img.width + 40 // Add padding
            canvas.height = img.height + 40
            if (ctx) {
                ctx.fillStyle = 'white'
                ctx.fillRect(0, 0, canvas.width, canvas.height)
                ctx.drawImage(img, 20, 20)
                const pngFile = canvas.toDataURL('image/png')
                const downloadLink = document.createElement('a')
                downloadLink.download = `temp-email-qr-${email}.png`
                downloadLink.href = pngFile
                downloadLink.click()
            }
        }

        img.src = 'data:image/svg+xml;base64,' + btoa(svgData)
    }

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 20 }}
                        className="relative w-full max-w-sm bg-[#1a1a1a] border border-white/10 rounded-2xl shadow-2xl overflow-hidden"
                    >
                        {/* Header Decoration */}
                        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary to-purple-500"></div>

                        <div className="p-6">
                            <div className="flex items-center justify-between mb-6">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 rounded-lg bg-primary/10 border border-primary/20">
                                        <QrCode className="w-5 h-5 text-primary" />
                                    </div>
                                    <h3 className="text-xl font-bold text-white">QR Code</h3>
                                </div>
                                <button
                                    onClick={onClose}
                                    className="p-1 hover:bg-white/5 rounded-lg transition-colors text-gray-400 hover:text-white"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            <div className="flex flex-col items-center">
                                <div className="p-4 bg-white rounded-xl mb-4">
                                    <QRCodeSVG
                                        ref={svgRef}
                                        value={email}
                                        size={200}
                                        level="H"
                                        includeMargin={false}
                                    />
                                </div>
                                <p className="text-secondary text-sm font-mono mb-8 break-all text-center">
                                    {email}
                                </p>

                                <div className="flex gap-3 w-full">
                                    <Button
                                        variant="secondary"
                                        onClick={onClose}
                                        className="flex-1 bg-white/5 border-white/10 hover:bg-white/10"
                                    >
                                        Close
                                    </Button>
                                    <Button
                                        variant="primary"
                                        onClick={downloadQRCode}
                                        className="flex-1 shadow-[0_0_20px_rgba(var(--primary-rgb),0.3)]"
                                        icon={<Download className="w-4 h-4" />}
                                    >
                                        Save
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    )
}
