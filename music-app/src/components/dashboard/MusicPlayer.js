import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Grid } from '@material-ui/core';
import Paper from '@material-ui/core/Paper';
import List from '@material-ui/core/List';
import { getCurrentSong, getTrackInfo } from '../../actions';
import SkipLeft from '../../assets/skip-left.png';
import SkipRight from '../../assets/skip-right.png';
import Rocket from '../../assets/rocket-like.png';
import Meteor from '../../assets/meteor-dislike.png';
import Pause from '../../assets/player-stop.png';
import Play from '../../assets/player-start.png';
import '../../App.css';
import LinearDeterminate from '../LinearDeterminate';
import Chart from '../Chart';
import Characteristics from '../Characteristics.js';
import AudioDetails from './AudioDetails';

class MusicPlayer extends Component {
  constructor(props) {
    super(props);
    this.state = {
      token: localStorage.getItem('token'),
      deviceId: '',
      loggedIn: false,
      error: '',
      trackName: 'Track Name',
      artistName: 'Artist Name',
      albumName: 'Album Name',
      imageUrl: '',
      playing: false,
      position: 0,
      duration: 1,
      id: '',
      songFeatures: [],
      collapse: false,
    };
    // this will later be set by setInterval
    this.playerCheckInterval = null;
  }

  componentDidMount() {
    this.handleLogin();
  }

  handleLogin() {
    if (this.state.token !== '') {
      this.setState({ loggedIn: true });
      this.playerCheckInterval = setInterval(() => this.checkForPlayer(), 1000);
    }
  }

  openAudioDetails() {
    this.setState({
      collapse: !this.state.collapse,
    });
  }

  // when we receive a new update from the player
  onStateChanged(state) {
    // only update if we got a real state
    if (state !== null) {
      const {
        current_track: currentTrack,
        position,
        duration,
      } = state.track_window;
      const trackName = currentTrack.name;
      const albumName = currentTrack.album.name;
      const artistName = currentTrack.artists
        .map(artist => artist.name)
        .join(', ');
      const playing = !state.paused;
      this.setState({
        position,
        duration,
        trackName,
        albumName,
        artistName,
        playing,
      });
    } else {
      // state was null, user might have swapped to another device
      this.setState({
        error: 'Looks like you might have swapped to another device?',
      });
    }
  }

  createEventHandlers() {
    this.player.on('initialization_error', e => {
      console.error(e);
    });

    this.player.on('authentication_error', e => {
      console.error(e);
      this.setState({ loggedIn: false });
    });

    this.player.on('account_error', e => {
      console.error(e);
    });

    this.player.on('playback_error', e => {
      console.error(e);
    });

    this.player.on('player_state_changed', state => {
      this.onStateChanged(state);
      this.currentSong();
      this.getCurrentSongFeatures(this.props.song.id);
    });

    this.player.on('ready', async data => {
      let { device_id } = data;

      await this.setState({
        deviceId: device_id,
        loggedIn: true,
      });
      this.transferPlaybackHere();
    });
  }

  checkForPlayer() {
    const { token } = this.state;

    if (window.Spotify !== undefined) {
      clearInterval(this.playerCheckInterval);

      this.player = new window.Spotify.Player({
        name: 'Music Meteorologist Spotify Player',
        getOAuthToken: cb => {
          cb(token);
        },
      });

      this.createEventHandlers();

      this.player.connect();
    }
  }

  async currentSong() {
    try {
      await this.props.getCurrentSong();
      if (this.props.song === undefined) {
        this.props.getCurrentSong();
      } else {
      }
    } catch (e) {}
  }

  getCurrentSongFeatures = id => {
    this.props.getTrackInfo(id);
  };

  // SDK Player Song playback controls
  onPrevClick() {
    this.player.previousTrack();
    this.player.setVolume(0);
    setTimeout(() => {
      this.player.pause();
      this.player.setVolume(0.5);
    }, 1000);
  }

  onPlayClick() {
    this.player.togglePlay();
  }

  onNextClick() {
    this.player.nextTrack();
    this.player.setVolume(0);
    setTimeout(() => {
      this.player.pause();
      this.player.setVolume(0.5);
    }, 1000);
  }

  transferPlaybackHere() {
    const { token } = this.state;
    fetch(
      `https://api.spotify.com/v1/me/player/play?device_id=${this.state.deviceId}`,
      {
        method: 'PUT',
        headers: {
          authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          // This is where we will control what music is fed to the user
          // If we want to direct them to a specific playlist,artist or album we will pass in "context_uri" with its respective uri
          context_uri:
            'spotify:user:spotifycharts:playlist:37i9dQZEVXbMDoHDwVN2tF', //Directs User to Global Top 50 playlist curated by spotify

          // In order manipulate the user's queue and feed them a more fluid and unique array of songs we would instead
          // pass an array of song uris through the "uris" key
          // The example below if uncommented will direct the user to 3 songs (make sure to comment out the context_uri)
          // uris:["spotify:track:0aULRU35N9kTj6O1xMULRR","spotify:track:0VgkVdmE4gld66l8iyGjgx","spotify:track:5ry2OE6R2zPQFDO85XkgRb"]
        }),
      },
    );
    this.player.setVolume(0);
    setTimeout(() => this.player.pause(), 1000);
    this.player.setVolume(0.5);
  }

  render() {
    const { trackName, artistName, albumName, error, playing } = this.state;

    return (
      // <Grid
      //   container
      //   direction='row'
      //   justify='center'
      //   alignItems='center'
      //   spacing={6}>
      <div className='music-player joyride-player-2'>
        <div classname='music-component'>
          <Grid item style={{ maxWidth: '300px' }}>
            {this.props.imageUrl[1] && (
              <img
                ref='image'
                src={this.props.imageUrl[1].url}
                alt='Album artwork cover.'
                style={{ maxWidth: '300px', objectFit: 'scale-down' }}
              />
            )}
            <p className='p' style={{ fontWeight: 'bold' }}>
              {trackName}
            </p>
            <p>{artistName}</p>
            <p>{albumName}</p>
          </Grid>
        </div>

        <div classname='music-component music-chart'>
          <Grid
            container
            direction='column'
            justify='center'
            alignItems='center'>
            <Grid item className='grid-chart joyride-3'>
              <div style={{ textAlign: 'right' }}>
                <button
                  onClick={() => this.openAudioDetails()}
                  className='grid-question'
                  title='Click for Audio Features details'
                  style={{ margin: 0, borderRadius: '25px' }}>
                  ?
                </button>
              </div>
              <List>
                <Paper
                  className={
                    this.state.collapse
                      ? 'audio-details-open'
                      : 'audio-details-closed'
                  }
                  style={{
                    maxHeight: 510,
                    width: 450,
                    overflow: 'auto',
                    backgroundColor: '#1a567a',
                    // backgroundColor: `rgba(${34}, ${109}, ${155}, ${0.98})`,
                    color: 'lightgray',
                  }}>
                  <AudioDetails />
                </Paper>
              </List>
              <Chart
                features={this.props.traits}
                style={{ width: '100%', objectFit: 'scale-down' }}
              />
            </Grid>
            <Grid item>
              {window.Spotify !== undefined &&
                this.state.imageUrl !== '' &&
                artistName !== 'Artist Name' && (
                  <div className='album-art'>
                    <h4 style={{ textAlign: 'center' }}>Now Playing</h4>
                    <img src={this.state.imageUrl} alt='album-art' />
                  </div>
                )}
            </Grid>

            {error && <p>Error: {error}</p>}

            <Grid
              container
              direction='row'
              justify='center'
              alignItems='center'
              style={{ width: 300, marginBottom: '5%' }}>
              <div className='joyride-dislike-4'>
                <button
                  className='like-dislike dislike'
                  style={{
                    background: 'none',
                    border: 'none',
                    outline: 'none',
                  }}
                  onClick={() => this.onPrevClick()}>
                  <img
                    src={Meteor}
                    alt='Dislike Button'
                    style={{ maxHeight: 70 }}
                  />
                </button>
                <h5 style={{ textAlign: 'center', marginTop: '10px' }}>
                  DISLIKE
                </h5>
              </div>

              <div
                style={{ padding: '0px 15px 0px 15px' }}
                className='joyride-prediction-5'>
                <h5 style={{ textAlign: 'center' }}>Prediction: </h5>
                <h3 style={{ textAlign: 'center' }}>100% </h3>
              </div>
              <div className='joyride-like-6'>
                <button
                  className='like-dislike like'
                  style={{
                    background: 'none',
                    border: 'none',
                    outline: 'none',
                  }}
                  onClick={() => this.onNextClick()}>
                  <img
                    src={Rocket}
                    alt='Like Button'
                    style={{ maxHeight: 70 }}
                  />
                </button>
                <h5 style={{ textAlign: 'center', marginTop: '10px' }}>LIKE</h5>
              </div>
            </Grid>

            <Grid
              container
              direction='column'
              justify='center'
              alignItems='center'
              style={{ width: 300, marginBottom: '5%' }}>
              <div>
                <LinearDeterminate player={this.player} />
              </div>
              <div style={{ display: 'flex' }}>
                <button
                  style={{
                    background: 'none',
                    border: 'none',
                    outline: 'none',
                  }}
                  onClick={() => this.onPrevClick()}>
                  <img
                    src={SkipLeft}
                    alt='White icon to skip to the previous song.'
                    style={{ maxHeight: 22 }}
                  />
                </button>

                <button
                  style={{
                    background: 'none',
                    border: 'none',
                    outline: 'none',
                  }}
                  onClick={() => this.onPlayClick()}>
                  {playing ? (
                    <img
                      ref={input => (this.inputElement = input)}
                      src={Pause}
                      alt='White icon to pause a song.'
                      style={{ maxHeight: 35 }}
                    />
                  ) : (
                    <img
                      /* ref={this.simulateClick} */
                      src={Play}
                      alt='White icon to start a pause song.'
                      style={{ maxHeight: 35 }}
                    />
                  )}
                </button>

                <button
                  style={{
                    background: 'none',
                    border: 'none',
                    outline: 'none',
                  }}
                  onClick={() => this.onNextClick()}>
                  <img
                    src={SkipRight}
                    alt='White icon to skip to the next song.'
                    style={{ maxHeight: 22 }}
                  />
                </button>
              </div>
            </Grid>
          </Grid>
        </div>

        <div classname='music-component'>
          <Characteristics features={this.props.traits} />
        </div>
      </div>
    );
  }
}

const mapStateToProps = state => ({
  song: state.currentSongReducer.item,
  imageUrl: state.currentSongReducer.imageUrl,
  traits: state.getTrackInfoReducer,
});

export default connect(
  mapStateToProps,
  { getTrackInfo, getCurrentSong },
)(MusicPlayer);
