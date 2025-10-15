import { makeRnEEClass, resolveNativeModule } from './utils';

const { RNScreenshotPrevent: nativeModule } = resolveNativeModule(
  'RNScreenshotPrevent',
);

type Listeners = {
  userDidTakeScreenshot: (ret?: {
    androidScanEmpty?: string;
    androidHasPermission?: boolean;
    captured?: boolean;
    path?: string;
    height?: string | number;
    width?: string | number;
    imageBase64?: string;
    imageType?: 'jpeg' | 'png';
    name?: string;
  }) => any;
  screenCapturedChanged: (ret: { isBeingCaptured: boolean }) => any;
  screenCaptureDetectionChanged: (ret: { enabled: boolean }) => any;
  androidOnLifeCycleChanged: (ret: { state: 'resume' | 'pause' }) => any;
  preventScreenshotChanged: (ret: { enabled: boolean }) => any;
};

const { NativeEventEmitter: eventEmitter } = makeRnEEClass<Listeners>();

const makeDefaultHandler = <K extends keyof Listeners>(fn: Listeners[K]) => {
  if (!eventEmitter) return fn;
  return null;
};

function iosOnUserDidTakeScreenshot(fn: Listeners['userDidTakeScreenshot']) {
  const handler = makeDefaultHandler<'userDidTakeScreenshot'>(fn);
  if (handler) return handler;

  return new eventEmitter(nativeModule).addListener(
    'userDidTakeScreenshot',
    fn,
  );
}

function iosOnScreenCaptureChanged(fn: Listeners['screenCapturedChanged']) {
  const handler = makeDefaultHandler<'screenCapturedChanged'>(fn);
  if (handler) return handler;

  return new eventEmitter(nativeModule).addListener(
    'screenCapturedChanged',
    fn,
  );
}

function androidOnLifeCycleChanged(fn: Listeners['androidOnLifeCycleChanged']) {
  const handler = makeDefaultHandler<'androidOnLifeCycleChanged'>(fn);
  if (handler) return handler;

  return new eventEmitter(nativeModule).addListener(
    'androidOnLifeCycleChanged',
    fn,
  );
}

function onPreventScreenshotChanged(fn: Listeners['preventScreenshotChanged']) {
  const handler = makeDefaultHandler<'preventScreenshotChanged'>(fn);
  if (handler) return handler;

  return new eventEmitter(nativeModule).addListener(
    'preventScreenshotChanged',
    fn,
  );
}

function onScreenCaptureDetectionChanged(
  fn: Listeners['screenCaptureDetectionChanged'],
) {
  const handler = makeDefaultHandler<'screenCaptureDetectionChanged'>(fn);
  if (handler) return handler;

  return new eventEmitter(nativeModule).addListener(
    'screenCaptureDetectionChanged',
    fn,
  );
}

// if (__DEV__) {
//   iosOnUserDidTakeScreenshot(() => {
//     console.debug('userDidTakeScreenshot');
//   });
//   iosOnScreenCaptureChanged(params => {
//     console.debug('screenCapturedChanged', params);
//   });
//   onPreventScreenshotChanged(params => {
//     console.debug('preventScreenshotChanged', params);
//   });
//   nativeModule.iosProtectFromScreenRecording();
// }

const RNScreenshotPrevent = Object.freeze({
  ...nativeModule,
  onPreventScreenshotChanged,
  // iosToggleBlurView(bool: boolean) {
  //   nativeModule.iosToggleBlurView(!!bool);
  // },
  iosOnScreenCaptureChanged,
  iosOnUserDidTakeScreenshot,
  androidOnLifeCycleChanged,
  onScreenCaptureDetectionChanged,
});

export default RNScreenshotPrevent;
