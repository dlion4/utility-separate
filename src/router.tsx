import { createRouter, createRootRoute } from '@tanstack/react-router'
import { routeTree } from './routeTree.gen'

const rootRoute = createRootRoute()

const router = createRouter({ routeTree })

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router
  }
}

export default router
