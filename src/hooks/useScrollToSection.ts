import { useCallback, useEffect, useRef, useState } from 'react'

interface UseScrollToSectionOptions {
  offset?: number
  scrollBehavior?: ScrollBehavior
}

/**
 * Hook for managing scroll-to-section functionality with active section detection
 */
export function useScrollToSection(
  sections: Array<{ slug: string; title: string }>,
  options: UseScrollToSectionOptions = {},
) {
  const { offset = 70, scrollBehavior = 'smooth' } = options
  const [activeSection, setActiveSection] = useState(sections?.[0]?.slug ?? '')
  const scrollAreaRef = useRef<HTMLDivElement>(null)

  const scrollToSection = useCallback(
    (sectionSlug: string) => {
      const section = document.getElementById(sectionSlug)
      if (section) {
        const elementPosition = section.offsetTop
        const offsetPosition = elementPosition - offset

        window.scrollTo({
          top: offsetPosition,
          behavior: scrollBehavior,
        })
      }
    },
    [offset, scrollBehavior],
  )

  const scrollActiveTabIntoView = useCallback(() => {
    const activeTabElement = document.querySelector(`[data-state="active"]`) as HTMLElement
    if (activeTabElement && scrollAreaRef.current) {
      const scrollArea = scrollAreaRef.current
      const scrollContainer = scrollArea.querySelector(
        '[data-radix-scroll-area-viewport]',
      ) as HTMLElement

      if (scrollContainer) {
        const tabRect = activeTabElement.getBoundingClientRect()
        const containerRect = scrollContainer.getBoundingClientRect()

        // Check if tab is out of view
        if (tabRect.left < containerRect.left || tabRect.right > containerRect.right) {
          const tabOffsetLeft = activeTabElement.offsetLeft
          const containerWidth = scrollContainer.clientWidth
          const tabWidth = activeTabElement.offsetWidth

          // Calculate the position to center the tab
          const targetScrollLeft = tabOffsetLeft - containerWidth / 2 + tabWidth / 2

          scrollContainer.scrollTo({
            left: targetScrollLeft,
            behavior: 'smooth',
          })
        }
      }
    }
  }, [])

  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY + offset
      const documentHeight = document.documentElement.scrollHeight
      const windowHeight = window.innerHeight
      const isAtBottom = scrollPosition + windowHeight >= documentHeight - 10 // 10px tolerance

      // If at bottom of page, set the last section as active
      if (isAtBottom && sections && sections.length > 0) {
        const lastSection = sections[sections.length - 1]
        setActiveSection(lastSection.slug ?? '')
        scrollActiveTabIntoView()
        return
      }

      // Find which section is currently in view
      for (const section of sections || []) {
        const element = document.getElementById(section.slug ?? '')
        if (element) {
          const { offsetTop, offsetHeight } = element
          if (scrollPosition >= offsetTop && scrollPosition < offsetTop + offsetHeight) {
            setActiveSection(section.slug ?? '')
            scrollActiveTabIntoView()
            break
          }
        }
      }
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [sections, offset, scrollActiveTabIntoView])

  return {
    activeSection,
    setActiveSection,
    scrollToSection,
    scrollAreaRef,
  }
}
