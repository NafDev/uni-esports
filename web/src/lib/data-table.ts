import { atom, computed, type WritableAtom } from 'nanostores';

type ValuesOf<T> = T[keyof T];

type DataRow<T> = Map<keyof T, ValuesOf<T>>;
type ColumnDef<T> = {
	accessor: keyof T;
	heading: string;
};

export function createTable<T>(data: WritableAtom<T[]>, columns: ColumnDef<T>[], pageSize: number) {
	const tableData = data;

	// This is writable as I want token based pagination
	const dataLength = atom(data.get().length);

	const pageCount = computed([dataLength], (dataLength) => Math.ceil(dataLength / pageSize));

	const pageIndex = atom(0);

	const headings = columns.map((columnDef) => columnDef.heading);

	const rows = computed([tableData], (data) => {
		const dataRows: Array<DataRow<T>> = [];

		for (const entry of data) {
			const row: DataRow<T> = new Map();

			for (const columnDef of columns) {
				row.set(columnDef.accessor, entry[columnDef.accessor]);
			}

			dataRows.push(row);
		}

		return dataRows;
	});

	const pagination = {
		dataLength,
		pageCount,
		pageIndex,
		nextPageAvailable: computed([pageCount, pageIndex], (pageCount, pageIndex) => {
			return pageIndex + 1 < pageCount;
		}),
		prevPageAvailable: computed([pageIndex], (pageIndex) => {
			return pageIndex + 1 > 1;
		})
	};

	return { tableData, headings, cellRows: rows, pagination };
}
