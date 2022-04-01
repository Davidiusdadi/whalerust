# Deploying to [vercel](https://vercel.com/)

Since whalerust requires e.g. `cargo` and `wasm-pack` I found the easiest way to deploy to vercel is to not deploy automatically upon commit but instead deploy manually:

For that configure vercel to:
  - use **no** build command, install command, deployment command - by setting them to empty
  
To deploy form you local cli:

  - install the vercel cli
  - build the whole project in order to populate '/public'
  - run `vercel/deploy.sh`

The .vercel config dir is expected to be located inside this (vercel) folder.