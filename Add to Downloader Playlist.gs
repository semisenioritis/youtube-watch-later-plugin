// there is no trigger for this script, just deploy it and add the url to the content,json 

function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);
    const videoUrl = data.url;
    const videoId = extractVideoId(videoUrl);
    if (!videoId) throw new Error('Invalid YouTube URL');

    const videoInfo = YouTube.Videos.list('snippet', {id: videoId});
    if (!videoInfo.items || videoInfo.items.length === 0) throw new Error('Video not found');

    const title = videoInfo.items[0].snippet.title;

    addVideoToPlaylistById(videoId);

    const response = {
      title: title,
      added: true
    };

    return ContentService.createTextOutput(JSON.stringify(response)).setMimeType(ContentService.MimeType.JSON);

  } catch (err) {
    const errorResponse = {
      added: false,
      error: err.message
    };
    return ContentService.createTextOutput(JSON.stringify(errorResponse)).setMimeType(ContentService.MimeType.JSON);
  }
}

function addVideoToPlaylistById(videoId) {
  const playlistId = '### id of the watch later playlist';
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
}

function extractVideoId(url) {
  const regex = /(?:https?:\/\/)?(?:www\.)?youtu(?:be\.com\/watch\?v=|\.be\/)([^\s&]+)/;
  const match = url.match(regex);
  return match ? match[1] : null;
}
