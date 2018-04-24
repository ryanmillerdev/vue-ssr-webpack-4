import { createApp } from "@/bootstrap";

export default async context => {
  const { url } = context
  const { app, router, store } = createApp()

  router.push(url)

  await new Promise((resolve, reject) => router.onReady(resolve, reject))

  const matchedComponents = router.getMatchedComponents()

  if (!matchedComponents.length) { throw new Error('404') }

  await Promise.all(matchedComponents.map(component => {
    if (component.asyncData) {
      return component.asyncData({
        store,
        route: router.currentRoute
      })
    }
  }))

  context.state = store.state

  return app
}