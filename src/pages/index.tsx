import { FunctionComponent } from 'react';
import Head from 'next/head';
import HomeHero from '../components/home/home_hero';
import Wrapper from '../components/home/wrapper';
import RuleList from '../components/home/rule_list';

import newestRules from '../data/newestRules.json';
import allTagSummaries from '../data/tagSummaries.json';

import { useRuleFilters } from '../lib/use_rule_filters';

const Index: FunctionComponent = () => {
  const {
    rules,
    tagSummaries,
    searchFilter,
    tagFilter,
    setSearchFilter,
    toggleTagType,
  } = useRuleFilters(newestRules, allTagSummaries);

  return (
    <>
      <Head>
        <title>Home</title>
      </Head>

      <Wrapper>
        <HomeHero
          rules={rules}
          tagSummaries={tagSummaries}
          searchFilter={searchFilter}
          tagFilter={tagFilter}
          onSearchChange={setSearchFilter}
          onTagChange={toggleTagType}
        />
        <RuleList rules={rules} />
      </Wrapper>
    </>
  );
};

export default Index;
