type ColorFunc = (str?: string | number) => string

type Framework = {
  name: string,
  display: string,
  color: ColorFunc,
  variants?: FrameVarianats[],
}

type FrameVarianats = {
  name: string,
  display: string,
  color: ColorFunc,
  customCommand?: string,
}

