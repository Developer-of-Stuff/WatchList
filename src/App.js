import { Amplify } from 'aws-amplify';
import { withAuthenticator } from '@aws-amplify/ui-react';
import { useEffect } from 'react';
import '@aws-amplify/ui-react/styles.css';
import config from './amplifyconfiguration.json';
Amplify.configure(config);

function App({ signOut, user }) {
  useEffect(() => {
    document.title = "Watch List";
  }, []);

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
        </div>
        <div className='footer'>
          <p>&copy; Watch List 2024</p>
        </div>
      </div>
    </div>
  );
}

export default withAuthenticator(App);