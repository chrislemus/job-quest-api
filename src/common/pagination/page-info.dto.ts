/** Page Information */
export class PageInfo {
  /** Current page number */
  currentPage: number;
  /** Requested page size */
  currentPageSize: number;
  /** Actual item/result count count of the current page  */
  currentPageCount: number;
  /** Total number of pages([pageTotalCount] query param must be set to `true` within your request) */
  totalPageCount?: number;
  /** Total item count ([pageTotalCount] query param must be set to `true` within your request) */
  totalCount?: number;
}
