import React, { Component } from "react";
import { connect } from "react-redux";

import LoadingPage from "../loading/loading.component";

import MusicPlayer from "../../components/music-player/music.player.component";

import { postDSSong } from "../../redux/ds/ds.actions";
import {
  getSeveralTracks,
  getSpotifyUser,
  getCurrentSong,
  getLikedSongStatus,
  getChartTrackInfo
} from "../../redux/spotify/spotify.actions";
// Styling
import "../../App.css";
import { transferPlaybackHere } from "../../utils/playerActions";

class Dashboard extends Component {
  state = {
    collapse: false,
    popout: false,
    playlistCreated: false
  };

  componentDidMount() {
    const { postDSSong, getSpotifyUser } = this.props;
    getSpotifyUser();
    postDSSong();
  }

  componentDidUpdate() {
    const { dsSongsData, getSeveralTracks, getCurrentSong } = this.props;

    getCurrentSong();
    this.initializePlayer();
    getSeveralTracks(dsSongsData);
  }

  // this is needed in order to get a device id to transfer playback to browser
  initializePlayer = () => {
    const {
      getCurrentSong,
      getLikedSongStatus,
      getChartTrackInfo
    } = this.props;
    const token = localStorage.getItem("token");

    this.player = new window.Spotify.Player({
      name: "Sound Drip Spotify Player",
      getOAuthToken: cb => {
        cb(token);
      }
    });
    

    this.player.on("player_state_changed", spotifyState => {
      getCurrentSong(spotifyState);
      getLikedSongStatus(spotifyState.track_window.current_track.id);
      getChartTrackInfo(spotifyState.track_window.current_track.id);
    });

    this.player.on("ready", data => {
      const { device_id } = data;
      transferPlaybackHere(token, device_id);
    });
    
    this.player.connect();
  };

  logout = e => {
    e.preventDefault();
    localStorage.removeItem("token");
    this.props.history.push("/logout");
  };

  render() {
    return (
      <div className="dashboard">
        {this.props.currentSongFetchingSuccess ? (
          <div>
            <MusicPlayer />
          </div>
        ) : (
          <LoadingPage dsError={this.props.dsError} />
        )}
      </div>
    );
  }
}

const mapStateToProps = state => ({
  dsSongsData: state.dsSongs.dsSongsData,
  currentSongFetchingSuccess: state.currentSong.currentSongFetchingSuccess,
  dsError: state.dsSongs.dsSongsFetchingErr
});

export default connect(mapStateToProps, {
  postDSSong,
  getSeveralTracks,
  getSpotifyUser,
  getCurrentSong,
  getLikedSongStatus,
  getChartTrackInfo
})(Dashboard);
