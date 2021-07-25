# Virtual Blur Cam

> This is a very crude version from [virtual-background](https://github.com/Volcomix/virtual-background) only used to get a camera stream with background blur

```sh
npm install blur-cam-stream
```

```js
import { BlurStream } from 'blur-cam';

const blurStream =  new BlurStream();

// First param video track constraints
// Second param output stream fps
// Example with default params
const blurStream = await blurStream.getBlurStream({
  { deviceId: "default" },
  30
})

// Dont forget to stop camera stream when not necessary
blurStream.stop();
```
