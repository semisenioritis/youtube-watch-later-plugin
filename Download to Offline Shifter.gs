// the trigger for this script is every day in the moring somet time like 5-6 am daily 

function fillOfflinePlaylist() {
  const OFFLINE_PLAYLIST_ID = '###id of the playlist to be downloaded';
  const WATCH_LATER_PLAYLIST_ID = '###id of the platylist where all the vidoes to watch later are stored';
  const TARGET_COUNT = 10;



  const offlineItems = getPlaylistItems(OFFLINE_PLAYLIST_ID);
  const currentCount = offlineItems.length;
  console.log(`Current number of videos in Offline: ${currentCount}`);

  if (currentCount >= TARGET_COUNT) {
    console.log('Offline playlist already has 10 or more videos.');
    return;
  }

  const needed = TARGET_COUNT - currentCount;
  console.log(`Need to add ${needed} videos to Offline.`);

  const watchLaterItems = getPlaylistItems(WATCH_LATER_PLAYLIST_ID);
  const toAdd = watchLaterItems.slice(0, needed);

  toAdd.forEach(item => {
    console.log(`Adding videoId ${item.snippet.resourceId.videoId} to Offline`);
    addVideoToPlaylist(OFFLINE_PLAYLIST_ID, item.snippet.resourceId.videoId);
    removeVideoFromPlaylist(WATCH_LATER_PLAYLIST_ID, item.id);
  });

  console.log('Done filling Offline playlist.');
}

function getPlaylistItems(playlistId) {
  let items = [];
  let nextPageToken;
  do {
    const response = YouTube.PlaylistItems.list('snippet', {
      playlistId: playlistId,
      maxResults: 50,
      pageToken: nextPageToken
    });
    items = items.concat(response.items);
    nextPageToken = response.nextPageToken;
  } while (nextPageToken);
  return items;
}

function addVideoToPlaylist(playlistId, videoId) {
  try {
    const resource = {
      snippet: {
        playlistId: playlistId,
        resourceId: {
          kind: 'youtube#video',
          videoId: videoId
        }
      }
    };
    YouTube.PlaylistItems.insert(resource, 'snippet');
  } catch (e) {
    console.error(`Error adding video ${videoId}: ${e.message}`);
  }
}

function removeVideoFromPlaylist(playlistId, playlistItemId) {
  try {
    YouTube.PlaylistItems.remove(playlistItemId);
    console.log(`Removed video from Watch Later playlist: ${playlistItemId}`);
  } catch (e) {
    console.error(`Error removing video from playlist: ${e.message}`);
  }
}
