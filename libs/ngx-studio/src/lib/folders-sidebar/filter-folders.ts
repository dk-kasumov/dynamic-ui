import { Folder } from './folder.model'

export function filterFolders(folders: Folder[], query: string): Folder[] {
  const q = query.trim().toLowerCase()
  if (!q) return folders

  return folders.flatMap(folder => {
    if (folder.name.toLowerCase().includes(q)) return [folder]

    const children = filterFolders(folder.children ?? [], q)
    const items = (folder.items ?? []).filter(i => i.name.toLowerCase().includes(q))
    return children.length || items.length ? [{ ...folder, children, items }] : []
  })
}
