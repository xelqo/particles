# Stipple

**[xelqo.github.io/particles](https://xelqo.github.io/particles/)**

Upload an image. It gets shredded into a few thousand dots. Move your mouse and they run away from it, then crawl back like nothing happened.

That's the whole thing.

## Using it

1. Choose image.
2. Pick a size, if you care. You probably don't.
3. Hit Go.
4. Wave your cursor around for longer than you'd like to admit.

## Notes

Dark pixels get dropped, and so do the edges. It keeps the bright middle of your image and throws the rest out. High-contrast pictures with a clear subject look good. Everything else looks like static.

Big images with `gap` set low will cook your fan. Turn it up if things get sluggish. It's at the top of the `Effect` class, you'll find it.

## Stack

Canvas

## Running it locally

No build, no install, no `node_modules` graveyard.

```
python3 -m http.server
```
