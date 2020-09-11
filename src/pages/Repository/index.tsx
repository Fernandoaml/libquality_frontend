import React, { useEffect, useState } from 'react';
import { Chart } from 'react-google-charts';
import { useRouteMatch, Link } from 'react-router-dom';
import {
  startOfDay,
  differenceInDays,
  parseISO,
  isEqual,
  getDaysInMonth,
  format,
} from 'date-fns';
// eslint-disable-next-line import/no-unresolved
import { FiChevronLeft } from 'react-icons/fi';

import api from '../../services/api';
import { Header, RepositoryInfo } from './styles';
import logoImage from '../../assets/libQualityLogo.svg';

interface RepositoryParams {
  repository: string;
}

interface IRepositoryData {
  fullName: string;
  id: string;
  ownerAvatarUrl: string;
  language: string;
  openIssuesCount: number;
  size: number;
  stargazersCount: number;
  forksCount: number;
}

interface IIssueData {
  createdAt: string;
  id: string;
  issuesTotal: number;
  newestIssue: string;
  oldestIssue: string;
  repositoryId: string;
  searchedDate: string;
  meanOfIssue: number;
  deviationOfIssue: number;
}

const Repository: React.FC = () => {
  const [repositoryData, setRepositoryData] = useState<IRepositoryData | null>(
    null,
  );
  const [issues, setIssues] = useState<IIssueData[] | null>(null);
  const [issueOfDay, setIssuesOfDay] = useState<IIssueData | null>(null);
  const [chartData, setChartData] = useState<(string | number)[][]>();
  const { params } = useRouteMatch<RepositoryParams>();

  const dataChart: (string | number)[][] = [];
  const options = {
    title: `Total Issues from ${repositoryData?.fullName} | Days`,
    curveType: '',
    legend: { position: 'bottom' },
    backgroundColor: '#E5E5E5',
    is3D: true,
    legend_toggle: true,
  };

  useEffect(() => {
    api
      .post(`/repositories`, {
        repoName: params.repository,
      })
      .then(response => {
        const { repository, issueData } = response.data;
        setRepositoryData(repository);
        setIssues(issueData);
      });
  }, [params.repository]);

  useEffect(() => {
    const compareDate = startOfDay(new Date());
    if (issues) {
      issues.forEach(data => {
        const date = parseISO(data.searchedDate);
        if (isEqual(date, compareDate)) {
          setIssuesOfDay({
            ...data,
            meanOfIssue: Math.round(Number(data.meanOfIssue)),
            deviationOfIssue: Math.round(Number(data.deviationOfIssue)),
          });
        }
      });
    }
  }, [issues]);

  useEffect(() => {
    if (issues) {
      const listWithDays: any = [];
      const daysOfMonth = getDaysInMonth(new Date());
      const listLenghtDays = new Array(daysOfMonth).fill(undefined);
      listLenghtDays.map((_, page) => listWithDays.push(page + 1));
      dataChart.push(['Date', 'Issues']);
      issues.map(data => {
        const { issuesTotal, searchedDate } = data;
        const dateFormated = format(parseISO(searchedDate), 'yyyy/MM/dd');
        return dataChart.push([dateFormated, issuesTotal]);
      });
      setChartData(dataChart);
    }
    // eslint-disable-next-line
  }, [issues]);
  return (
    <>
      <Header>
        <img src={logoImage} alt="Lib Quality" />
        <Link to="/">
          <FiChevronLeft size={20} />
          Back
        </Link>
      </Header>
      {repositoryData && (
        <RepositoryInfo>
          <header>
            <img
              src={repositoryData.ownerAvatarUrl}
              alt={repositoryData.fullName}
            />
            <div>
              <strong>{params.repository}</strong>
              <p>
                {'Language: '}
                {repositoryData.language}
              </p>
            </div>
          </header>
          <ul>
            <li>
              <strong>{repositoryData.stargazersCount}</strong>
              <span>Stars</span>
            </li>
            <li>
              <strong>{repositoryData.forksCount}</strong>
              <span>Forks</span>
            </li>
            <li>
              <strong>{repositoryData.openIssuesCount}</strong>
              <span>Open Issues</span>
            </li>
            {issueOfDay && (
              <li>
                <strong>
                  {issueOfDay.meanOfIssue}
                  {'d '}
                </strong>
                <span>Avg Age</span>
              </li>
            )}
            {issueOfDay && (
              <li>
                <strong>
                  {issueOfDay.deviationOfIssue}
                  {'d '}
                </strong>
                <span>Std Age</span>
              </li>
            )}
            {issueOfDay && (
              <li>
                <strong>
                  {differenceInDays(
                    new Date(),
                    parseISO(issueOfDay.oldestIssue),
                  )}
                  {'d '}
                </strong>
                <span>Oldest Issue</span>
              </li>
            )}
          </ul>
        </RepositoryInfo>
      )}
      {chartData && (
        <div>
          <Chart
            chartType="LineChart"
            max-width="960px"
            height="400px"
            data={chartData}
            options={options}
          />
        </div>
      )}
    </>
  );
};

export default Repository;
