export interface FolderItem {
  id: string | number
  name: string
  [key: string]: unknown
}

export interface Folder {
  id: string | number
  name: string
  children?: Folder[]
  items?: FolderItem[]
}
