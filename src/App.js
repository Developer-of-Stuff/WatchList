import { Amplify } from 'aws-amplify';
import { generateClient } from 'aws-amplify/api';
import * as mutations from './graphql/mutations';
import * as queries from './graphql/queries';
import { withAuthenticator } from '@aws-amplify/ui-react';
import { useEffect, useState } from 'react';
// import '@aws-amplify/ui-react/styles.css';
import './App.css';
import config from './amplifyconfiguration.json';
Amplify.configure(config);

const appsyncClient = generateClient();

async function retrieveEntries() {
  const entriesList = await appsyncClient.graphql({
    query: queries.listMedia
  });

  return entriesList.data.listMedia;
}

async function addEntry(formDataObj, user) {
  const addMediaResult = await appsyncClient.graphql({
    query: mutations.createMedia,
    variables: {
      input: {
        name: formDataObj.title,
        medium: formDataObj.medium === 'movie' ? 'MOVIE' : 'SHOW',
        creatorId: user.username,
        watched: false
      }
    }
  });

  console.log(addMediaResult);
}

async function updateEntry(id, watched, formDataObj=null) {
  let input;

  if (formDataObj) {
    input = {
      id: id,
      name: formDataObj.title,
      medium: formDataObj.medium === 'movie' ? 'MOVIE' : 'SHOW',
      watched: formDataObj.watched
    }
  } else {
    input = {
      id: id,
      watched: watched
    }
  }

  const updateMediaResult = await appsyncClient.graphql({
    query: mutations.updateMedia,
    variables: {
      input: input
    }
  });

  console.log(updateMediaResult);
}

async function deleteEntry(id) {
  const deleteMediaResult = await appsyncClient.graphql({
    query: mutations.deleteMedia,
    variables: {
      input: {
        id: id
      }
    }
  });

  console.log(deleteMediaResult);
}

function createEntries(mediaEntries) {
  const entries = [];
  const handleCheck = async (e) => {
    const target = e.target;
    const entryId = target.parentNode.parentNode.id;
    try {
      await updateEntry(entryId, target.checked);
    } catch (error) {
      console.error(error);
    }
  };

  const handleUpdate = async (e) => {
    const target = e.target;
    const entryId = target.parentNode.parentNode.id;

  };

  const handleDelete = async (e) => {
    const target = e.target;
    const entryId = target.parentNode.parentNode.id;
    try {
      await deleteEntry(entryId);
      target.parentNode.parentNode.remove();
    } catch (error) {
      console.error(error);
    }
  };

  for (let i = 0; i < mediaEntries.length; i++) {
    const wasWatched = <input type='checkbox' onClick={handleCheck} defaultChecked />
    const notWatched = <input type='checkbox' onClick={handleCheck}/>
    entries.push(
      <ul key={i} id={mediaEntries[i].id}>
        <li className='entry entry-name'>{mediaEntries[i].name}</li>
        <li className='entry entry-medium'>{mediaEntries[i].medium}</li>
        <li className='entry entry-createdAt'>{mediaEntries[i].createdAt}</li>
        <li className='entry entry-creatorId'>{mediaEntries[i].creatorId}</li>
        <li className='entry entry-watched'>
          {mediaEntries[i].watched ? wasWatched : notWatched}
        </li>
        <li>
          <button className='btn update-btn'>Update Item</button>
        </li>
        <li>
          <button className='btn delete-btn' onClick={handleDelete}>Delete Item</button>
        </li>
      </ul>
    );
  }

  return entries;
}


function App({ signOut, user }) {
  
  const [entries, setEntries] = useState();

  useEffect(() => {
    document.title = "Watch List";
    async function loadEntries() {
      const entries = (await retrieveEntries()).items;
      setEntries(createEntries(entries));
      console.log("Loaded entries")
    }

    loadEntries();
  }, []);


  async function formSubmit(e) {
    e.preventDefault();
    console.log('submit form event fired');
    let form = e.target;
    let formData = new FormData(form);
    let formDataObj = Object.fromEntries(formData.entries())
    console.log(formDataObj);

    if (formDataObj.title === '') {
      alert('Title is required')
    }

    else {
      try {
        await addEntry(formDataObj, user);
        
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
        <div className='header border-bottom'>
          <h1>
            <a href="#">Watch List</a>
          </h1>
          <nav>
            <ul>
              <li><a href='#'>Home</a></li>
              <li><a href='#'>About</a></li>
            </ul>
          </nav>
        </div>
        <div className='main'>
          <div className='section border-bottom'>
            <h2>Welcome, {user.signInDetails.loginId}!</h2>
            <button className='btn' onClick={signOut}>Sign out</button>
          </div>
          <div className='section border-bottom'>
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
          </div>
          <div className='section border-bottom'>
            <h2>Entries</h2>
            {entries}
          </div>
        </div>
        <div className='section footer'>
          <p>&copy; Watch List 2024</p>
        </div>
      </div>
    </div>
  );
}

export default withAuthenticator(App);