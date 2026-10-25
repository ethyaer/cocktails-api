export class PaginationUtil {
    private pageSize = 10;

    setPageSize(size: number) {
        this.pageSize = size;
    }

    getPageSize() {
        return this.pageSize;
    }

    private getNumberOfPages(totalItems: number): number {
        return (totalItems / this.pageSize) + ((totalItems % this.pageSize != 0) ? 1 : 0);
    }

    getPagination(page: number = 1, totalItems: number) {
        const offset = (page - 1) * this.pageSize;
        return { 
            offset, 
            limit: this.pageSize, 
            currentPage: page,
            totalPages: this.getNumberOfPages(totalItems) 
        };
    }
}