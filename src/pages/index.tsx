import { FunctionComponent, useState, useMemo } from 'react';
import Head from 'next/head';
import HomeHero from '../components/home/home_hero';
import Wrapper from '../components/home/wrapper';
import RuleList from '../components/home/rule_list';

import newestRules from '../data/newestRules.json';
import tagSummaries from '../data/tagSummaries.json';

import { TagSummary } from '../types';

const Index: FunctionComponent = () => {
  const [searchFilter, setSearchFilter] = useState('');
  const [tagFilter, setTagFilter] = useState([]);

  const rules = useMemo(() => {
    const newRules = newestRules.filter(function (r) {
      if (
        searchFilter &&
        !r.name.toLowerCase().includes(searchFilter.toLowerCase())
      ) {
        return false;
      }
      if (tagFilter.length > 0 && !tagFilter.every(t => r.tags.includes(t))) {
        return false;
      }
      return true;
    });
    return newRules;
  }, [searchFilter, tagFilter]);

  const filteredTagSummaries = useMemo(() => {
    const tagSummariesMap = new Map<string, TagSummary>();
    for (const t of tagSummaries) {
      tagSummariesMap.set(t.tag_full, {
        tag_full: t.tag_full,
        tag_name: t.tag_name,
        tag_type: t.tag_type,
        count: 0,
      });
    }
    for (const r of rules) {
      for (const t of r.tags) {
        const parts = t.split(': ');
        const s = tagSummariesMap.get(t);
        if (parts.length != 2 || s == undefined) {
          continue;
        }
        s.count++;
        tagSummariesMap.set(t, s);
      }
    }
    return Array.from(tagSummariesMap.values());
  }, [rules]);

  const updateTagFilter = function (type: string, selected: string[]) {
    setTagFilter(tagFilter.filter(x => !x.startsWith(type)).concat(selected));
  };

  return (
    <>
      <Head>
        <title>Home</title>
      </Head>

      <Wrapper>
        <HomeHero
          rules={rules}
          tagSummaries={filteredTagSummaries}
          searchFilter={searchFilter}
          tagFilter={tagFilter}
          onSearchChange={setSearchFilter}
          onTagChange={updateTagFilter}
        />
        <RuleList rules={rules} />
      </Wrapper>
    </>
  );
};

export default Index;
