export interface ListItem {
  itemName: string;
  itemUrl?: string;
  itemImgUrl?: string;
}

export interface ListEntry {
  list: ListItem[];
}
