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
	const pageCount = atom(data.get().length / pageSize);

	const pageIndex = atom(0);

	const headings = columns.map((columnDef) => columnDef.heading);

	const rows = computed([tableData, pageIndex], (data, page) => {
		const dataRows: Array<DataRow<T>> = [];

		const sliceStart = pageSize * page;
		const sliceEnd = pageSize * (page + 1);

		for (const entry of data.slice(sliceStart, sliceEnd)) {
			const row: DataRow<T> = new Map();

			for (const columnDef of columns) {
				row.set(columnDef.accessor, entry[columnDef.accessor]);
			}

			dataRows.push(row);
		}

		return dataRows;
	});

	const pagination = {
		pageCount,
		pageIndex,
		nextPageAvailable: computed([pageCount, pageIndex], (pageCount, pageIndex) => {
			return pageIndex + 1 < pageCount;
		}),
		prevPageAvailable: computed([pageCount, pageIndex], (pageCount, pageIndex) => {
			return pageIndex + 1 > pageCount;
		})
	};

	return { tableData, headings, cellRows: rows, pagination };
}
