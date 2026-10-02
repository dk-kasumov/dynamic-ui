import { Folder } from "./folder.model";

export function filterFolders(folders: Folder[], query: string): Folder[] {
  const q = query.trim().toLowerCase();
  if (!q) return folders;

  return folders.reduce<Folder[]>((result, folder) => {
    if (folder.name.toLowerCase().includes(q)) {
      result.push(folder);
      return result;
    }

    const children = filterFolders(folder.children ?? [], q);
    const items = (folder.items ?? []).filter((item) =>
      item.name.toLowerCase().includes(q),
    );

    if (children.length || items.length) {
      result.push({ ...folder, children, items });
    }
    return result;
  }, []);
}
