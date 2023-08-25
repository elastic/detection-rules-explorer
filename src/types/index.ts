export interface TagSummary {
  tag_type: string;
  tag_name: string;
  tag_full: string;
  count: number;
}

export interface RuleSummary {
  id: string;
  name: string;
  tags: Array<string>;
  updated_date: string;
}
