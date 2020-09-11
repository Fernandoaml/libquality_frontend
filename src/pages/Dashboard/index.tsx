import React, { useState, FormEvent, useEffect, useCallback } from 'react';
import { FiChevronRight, FiTrash } from 'react-icons/fi';
import { Link, useHistory } from 'react-router-dom';
import api from '../../services/api';

import logoImage from '../../assets/libQualityLogo.svg';
import { Title, SubTitle, Form, Repositories, Error, Header } from './styles';

interface IRepository {
  fullName: string;
  ownerAvatarUrl: string;
  language: string;
  htmlURL: string;
}

const Dashboard: React.FC = () => {
  const history = useHistory();
  const [newRepo, setNewRepo] = useState('');
  const [inputError, setInputError] = useState('');
  const [repositories, setRepositories] = useState<IRepository[]>(() => {
    const storageRepositories = localStorage.getItem(
      '@LibQuality:repositories',
    );
    if (storageRepositories) {
      return JSON.parse(storageRepositories);
    }
    return [];
  });

  useEffect(() => {
    localStorage.setItem(
      '@LibQuality:repositories',
      JSON.stringify(repositories),
    );
  }, [repositories]);

  const clearCache = useCallback(() => {
    localStorage.clear();

    history.go(0);
    // eslint-disable-next-line
  }, []);

  async function handleAddRepository(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!newRepo) {
      setInputError('Type a OWNER/REPOSITORY');
      return;
    }
    try {
      const response = await api.post(`/repositories`, {
        repoName: newRepo,
      });
      const { repository } = response.data;
      setRepositories([...repositories, repository]);
      setNewRepo('');
      setInputError('');
    } catch (error) {
      setInputError("Sorry... We can't find this repository.");
    }
  }

  return (
    <>
      <Header>
        <img src={logoImage} alt="Lib Quality" />
        <Link to="/" onClick={clearCache}>
          <FiTrash size={20} />
          Clear Cache
        </Link>
      </Header>
      <Title>LibQuality</Title>
      <SubTitle>
        This is a simple tool to compare quality of diferent open source
        libraries available in GitHub
      </SubTitle>
      <Form hasError={!!inputError} onSubmit={handleAddRepository}>
        <input
          value={newRepo}
          onChange={e => setNewRepo(e.target.value)}
          placeholder="Type repository name. Ex: facebook/react"
        />
        <button type="submit">Search</button>
      </Form>
      {inputError && <Error>{inputError}</Error>}
      <Repositories>
        {/* <Link to="/repository/LibQuality/DashBoard">
          <img
            src="https://w7.pngwing.com/pngs/836/323/png-transparent-computer-icons-infinity-symbol-icon-design-symbol-miscellaneous-text-trademark-thumbnail.png"
            alt="All repositories"
          />
          <div>
            <strong>Dashboard with all Repositories</strong>
            <p>Click to see all repositories on LibQuality!</p>
          </div>
          <FiChevronRight size={20} />
        </Link> */}
        {repositories.map(repository => (
          <Link
            key={repository.fullName}
            to={`/repository/${repository.fullName}`}
          >
            <img src={repository.ownerAvatarUrl} alt={repository.fullName} />
            <div>
              <strong>{repository.fullName}</strong>
              <p>
                {'Language: '}
                {repository.language}
              </p>
            </div>
            <FiChevronRight size={20} />
          </Link>
        ))}
      </Repositories>
    </>
  );
};

export default Dashboard;
