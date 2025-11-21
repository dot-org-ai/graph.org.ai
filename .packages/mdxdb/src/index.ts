// mdxdb Core Interface

export interface MdxDbCollection<T = any> {
  name: string;
  create(data: T): Promise<T>;
  get(id: string): Promise<T | null>;
  set(id: string, data: T): Promise<T>;
  delete(id: string): Promise<boolean>;
  list(globPattern?: string): Promise<T[]>;
  search(query: string | Record<string, any>): Promise<T[]>;
  update(id: string, data: Partial<T>): Promise<T>; // Keeping update for partial modifications
}

export interface MdxDb {
  collection<T = any>(name: string): MdxDbCollection<T>;
}
