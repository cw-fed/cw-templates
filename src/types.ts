export type ColorFunc = (str: string | number) => string

export type Framework = {
  name: string,
  display: string,
  color: ColorFunc,
  variants?: FrameVarianats[],
}

export type FrameVarianats = {
  name: string,
  display: string,
  color: ColorFunc,
  customCommand?: string,
}

