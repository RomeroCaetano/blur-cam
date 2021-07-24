# Virtual Blur Cam

> This is a very crude version from [virtual-background](https://github.com/Volcomix/virtual-background) only used to get a camera stream with background blur

```sh
    npm install blur-cam
```

```js
import { BlurStream } from 'blur-cam';

const blurStream =  new BlurStream();


const blurStream = await blurStream.getBlurStream({
  { deviceId: "default" },
  30
})

```
