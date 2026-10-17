import Image, { type ImageProps } from 'next/image'

// Hosts liberados em images.remotePatterns (next.config.js) — manter em sincronia.
const OPTIMIZABLE_HOSTS = [
  /\.public\.blob\.vercel-storage\.com$/,
  /^images\.unsplash\.com$/,
  /^lh3\.googleusercontent\.com$/,
]

function isOptimizable(src: string): boolean {
  if (src.startsWith('/') && !src.startsWith('//')) return true
  try {
    const { protocol, hostname } = new URL(src)
    return protocol === 'https:' && OPTIMIZABLE_HOSTS.some((re) => re.test(hostname))
  } catch {
    return false
  }
}

type CmsImageProps = Omit<ImageProps, 'src'> & { src: string }

/**
 * Imagem vinda do CMS: usa next/image (AVIF/WebP redimensionado) quando o host
 * está liberado; para qualquer outra URL cai num <img> comum em vez de quebrar
 * a página com o erro de host não configurado.
 */
export default function CmsImage({ src, ...props }: CmsImageProps) {
  if (isOptimizable(src)) return <Image src={src} {...props} />

  const { fill, sizes, priority, quality, placeholder, blurDataURL, loader, unoptimized, style, ...rest } = props
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      {...rest}
      alt={props.alt}
      loading={priority ? 'eager' : 'lazy'}
      decoding="async"
      style={fill ? { position: 'absolute', inset: 0, width: '100%', height: '100%', ...style } : style}
    />
  )
}
