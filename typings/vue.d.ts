import Vue from 'vue'
import { Route } from 'vue-router'

export interface AsyncDataOptions {
  route: Route,
}

declare module 'vue/types/options' {
  interface ComponentOptions<V extends Vue> {
    // used for data fetched before render both client and server-side
    asyncData?: (options: AsyncDataOptions) => Promise<any>;
    // used by vue-meta to inject head meta tags
    metaInfo?: any;
  }
}

