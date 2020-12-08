/**
 * mock some functions
 * @param func
 */
export default function mock<T extends (...params: any) => any>(func: T): T;
