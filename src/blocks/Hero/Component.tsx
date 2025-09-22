import React from 'react'

import { Button } from '@/components/ui/button'
import type { HeroBlock as HeroBlockProps } from '@/payload-types'
import { cn } from '@/utilities/ui'
import Image from 'next/image'
import Link from 'next/link'

export const HeroBlock: React.FC<HeroBlockProps> = ({ title, description, links }) => {
  return (
    <div className="container">
      <div className="flex flex-col items-center justify-center">
        <Image src="/media/logo.svg" alt="Logo" width={100} height={100} className="w-100 h-100" />

        <h1 className="text-4xl font-bold">{title}</h1>
        <p className="text-lg">{description}</p>

        <div className="flex flex-col items-center justify-center gap-2 w-full">
          {links &&
            links.map((link, index) => {
              let linkTitle = ''
              let linkUrl = ''
              let linkNewTab = false

              if (link['link-type'] === 'page' && typeof link.link === 'object') {
                linkTitle = link.link?.title || ''
                linkUrl = link.link?.slug || ''
              }

              if (link['link-type'] === 'custom' && typeof link.link_custom === 'object') {
                linkTitle = link.link_custom?.title || ''
                linkUrl = link.link_custom?.url || ''
                linkNewTab = link.link_custom?.newTab || false
              }

              return (
                <Button key={link.id} asChild className="w-full max-w-[200px]">
                  <Link
                    href={linkUrl}
                    target={linkNewTab ? '_blank' : '_self'}
                    className={cn(
                      index === 0
                        ? 'bg-primary text-primary-foreground hover:bg-primary/90'
                        : 'bg-secondary text-secondary-foreground hover:bg-secondary/80',
                    )}
                  >
                    {linkTitle}
                  </Link>
                </Button>
              )
            })}
        </div>
      </div>
    </div>
  )
}
