// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type OmitFromUnion<T, K extends keyof T> = T extends any
	? Omit<T, K>
	: never;

export type WithRequired<T, K extends keyof T> = T & Required<Pick<T, K>>;
