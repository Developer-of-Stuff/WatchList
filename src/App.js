import { Amplify } from 'aws-amplify';
import { generateClient } from 'aws-amplify/api';
import * as mutations from './graphql/mutations';
import * as queries from './graphql/queries';
import { withAuthenticator } from '@aws-amplify/ui-react';
import { useEffect, useState } from 'react';
import '@aws-amplify/ui-react/styles.css';
import config from './amplifyconfiguration.json';
Amplify.configure(config);

const appsyncClient = generateClient();

async function retrieveEntries() {
  const entriesList = await appsyncClient.graphql({
    query: queries.listMedia
  });

  return entriesList.data.listMedia;
}

const initialMediaEntries = (await retrieveEntries()).items;

function createEntries(mediaEntries) {
  const entries = [];
  for (let i = 0; i < mediaEntries.length; i++) {
    entries.push(
      <>
        <ul key={i} id={mediaEntries[i].id}>
          <li className='entry entry-name'>{mediaEntries[i].name}</li>
          <li className='entry entry-medium'>{mediaEntries[i].medium}</li>
          <li className='entry entry-createdAt'>{mediaEntries[i].createdAt}</li>
          <li className='entry entry-creatorId'>{mediaEntries[i].creatorId}</li>
        </ul>
      </>
    );
  }

  return entries;
}


function App({ signOut, user }) {
  const [entries, setEntries] = useState(() => createEntries(initialMediaEntries));

  useEffect(() => {
    document.title = "Watch List";
  }, []);


  async function formSubmit(e) {
    e.preventDefault();
    console.log('submit form event fired');
    let form = e.target;
    let formData = new FormData(form);
    let formDataObj = Object.fromEntries(formData.entries())
    console.log(formDataObj);

    if (formDataObj.title == '') {
      alert('Title is required')
    }

    else {
      try {
        const addMediaResult = await appsyncClient.graphql({
          query: mutations.createMedia,
          variables: {
            input: {
              name: formDataObj.title,
              medium: formDataObj.medium == 'movie' ? 'MOVIE' : 'SHOW',
              creatorId: user.username,
              watched: false
            }
          }
        });

        console.log(addMediaResult);
        
        const newEntries = (await retrieveEntries()).items;

        setEntries(() => createEntries(newEntries));
      } catch (error) {
        console.error(error);
      }
    }
  };

  return (
    <div className='app-container'>
      <div className='body'>
        <div className='header'>
          <h1>
            <a href="#">Watch List</a>
          </h1>
        </div>
        <div className='main'>
          <p>Welcome, {user.signInDetails.loginId}!</p>
          <button onClick={signOut}>Sign out</button>
          <hr/>
          <h2>Media Entry</h2>
          <form className='user-input' id='media-form' onSubmit={formSubmit}>
            <label htmlFor='title'>Title:</label>
            <input className='text-input' id='form-title' name='title' type='text'/>
            <label htmlFor='medium'>Type:</label>
            <select className='dropdown-input' id='form-medium' name='medium'>
              <option value='movie'>Movie</option>
              <option value='show'>Show</option>
            </select>
            <button className='btn' type='submit' id='form-submit'>Submit</button>
          </form>
          <hr/>
          <div className='entries'>
            {entries}
          </div>
        </div>
        <div className='footer'>
          <p>&copy; Watch List 2024</p>
        </div>
      </div>
    </div>
  );
}

export default withAuthenticator(App);