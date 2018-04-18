Vue SSR With Webpack 4 & Vue Loader 15
======================================

This repo serves as an example for those attempting to utilize Vue server-server side rendering (SSR) with the latest (at the time of writing) versions of Webpack and Vue Loader. 

## Setup

### Install Dependencies

First, ensure you're using a version of Node.js compatible with this project, which at the time of writing is `v8.11.1`. For [NVM](https://github.com/creationix/nvm) users, I've provided an `.nvmrc` file set to this version.

Once you've properly configured Node.js, install necessary dependencies using either 

`yarn` 

or

`npm install`

### Running in Development

Simply run `npm start` to fire up a development server. This will automatically compile necessary assets in-memory and comes with HMR.

### Running in Production

Run `webpack` prior to `npm start` in order to launch a server into production, as production configuration requires that bundles be available immediately at init.

## Deep Dive

Though projects like [Nuxt](https://nuxtjs.org/) attempt to abstract away the pain of manually configuring Vue SSR, I nevertheless wanted to deepen my understanding of how the core Vue SSR tooling functioned. Furthermore, the recent advent of a new Webpack version (4), plus updates to Vue Loader, meant that, at the time of writing, there was a real dearth of material on how all of it was supposed to work together. This section hopes to offer some explanatory context regarding all the configuration in this repo and why certain decisions were made.

### Initial Discoveries

My first foray into the world of Vue SSR was via the [Webpack Vue.js template](https://github.com/vuejs-templates/webpack). It does a terrific job of covering all of the bases a developer could need (full support for SASS, LESS, etc..., preloaded unit and E2E testing frameworks, separate dev/test/prod environments),  I found it a bit difficult to see the forest through the trees. So I stepped back and I picked over each file, trying to make sense of it all.

One path led to another and I learned of the release of [Webpack 4](https://medium.com/webpack/webpack-4-released-today-6cdb994702d4), which inevitably meant that, for all the goodness in the aforementioned template, a certain amount of it was already out-of-date. And so I made the decision at that point to put it all aside and try my hand at writing a bare-bones Vue SSR server.

### Getting Started

First things first, I created a repo with a skeleton Webpack configuration, a little Node.js server, and a Vue component to render. The goal was simply to create a site that had a single route, `/name/:name`, and was capable of rendering either the passed `name` property on the server, or doing so client-side using `<router-link />`. If you want to skip ahead and see a working example of what I mean, take a quick break here and follow the instructions in `Setup` above.

In addition to the primary goal above, I wanted:

1. To be able to extract any CSS for my site into its own file.
2. To keep my Webpack configuration as simple as possible (to a single file ideally).
3. To cache-bust every asset included in my project.

\#2 and \#3 above proved fairly trivial, at least in a set up without a need to reload the server bundle. But #1 was troublesome and if this deep dive can offer you nothing else, it can helped shed some light on why CSS extraction in Webpack is a tricky affair.

### Breaking It Down: `webpack.config.js` 

At this point, I'm going to take a break from the narrative style and switch to explaining what is arguably the most confusing file in this repo: the Webpack configuration file. I'm going to do this section by section, and feel free to gloss over this if you feel comfortable with Webpack. I didn't at the start of this endeavor and frankly I still don't. 

(I'm still fleshing this out, but feel free to take a look at the annotated [webpack.config.js](https://github.com/andRyanMiller/vue-ssr-webpack-4/blob/master/webpack.config.js) in the interim...)

... WIP


