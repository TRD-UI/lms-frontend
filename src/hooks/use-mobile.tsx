import * as React from "react"

const MOBILE_BREAKPOINT = 768
const QUERY = `(max-width: ${MOBILE_BREAKPOINT - 1}px)`

/**
 * Whether the viewport is narrower than the `md` breakpoint.
 *
 * The first value is read synchronously. Starting from `undefined` and filling
 * it in from an effect meant the first render always claimed "desktop", which
 * flashes the wrong layout and — where this gates a whole tree — mounts the
 * very thing it was meant to keep off the screen.
 */
export function useIsMobile() {
  const [isMobile, setIsMobile] = React.useState(
    () => typeof window !== "undefined" && window.matchMedia(QUERY).matches
  )

  React.useEffect(() => {
    const mql = window.matchMedia(QUERY)
    const onChange = (event: MediaQueryListEvent) => setIsMobile(event.matches)
    mql.addEventListener("change", onChange)
    setIsMobile(mql.matches)
    return () => mql.removeEventListener("change", onChange)
  }, [])

  return isMobile
}
