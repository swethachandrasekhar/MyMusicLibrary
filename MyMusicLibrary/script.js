      const app = {};
      let  artists = [];
      let myPlaylistItems = [];
      app.key = 'uktXFUkmWGSAPScNmKcF';
      app.secret = 'MFKElkJNRVlFuXZGwGjvKaTTeXPmEWiW';
      app.gkey = 'AIzaSyAzMWDQ3CtpBT92PYRP0Bruqce71A7HzBM';

    // Display search results 

      app.displayArtists = function(data) {
          // console.log('Inside display', data);
          data.forEach(element => {        
           const artistDetails = {
             id: element.id,
             title: element.title,
             uri: element.uri,
           }
           artists.push(artistDetails); 
            const htmlAppend = `
            <div class="artist">
               <div>
                 <img src="${element.cover_image}" alt="${element.title}" onerror="this.src='./mic.png';">
                </div>
                <div class="artist-name">
                  <p>${element.title}</p>
                  
                </div>
           </div>
            `;
          $('.search-results').append(htmlAppend);
        });
      }

      // Display Releases by Artists 

      app.displayReleases = function(data) {

        $('.library-results').empty();
        $('.search-results').empty();
        data.forEach(element => {         
        const appendHtml = `
        <div class="releases-section">
            <div class="release-image">
              <img src="${element.thumb}" alt="${element.title}">
            </div>
            <div class="release-name">
              <p>${element.title}</p>
              <p hidden="true">${element.artist}</p>
            </div>
            <div>
              <button  class="addButton">Add to playlist</button>
            </div> 
          </div>    

        `;
          $('.search-results').append(appendHtml);
        });
      }

      // Display my Library Playlist

      app.displayMyPlaylist = function() {

        console.log('my playlist', myPlaylistItems);
        $('.search-results').empty();
        $('.library-results').empty();     
        myPlaylistItems.forEach(function(element) {
          const appendHtml = `
            <div class="releases-section">  
              <div class="release-image">
                <img src="${element.thumbnail}" alt="${element.title}">
              </div>
              <div class="release-name">
              <p>${element.title}</p>
              </div>
          <div>
              <button class="removeButton">Remove Item</button>
            </div> 
          </div>    
        `;
          $('.library-results').append(appendHtml);
        })       
        };


        // Function to add items to Playlist 
      app.addToPlaylist = function(data) {

      console.log('data', data);
      const title = $(data).parent().prev().children().contents().text();
        
      const thumbnail = $(data).parent().prev().prev().children().attr('src');

      console.log('tile and thumbnail', title, thumbnail);
      const myPlaylistItem = {
          title: title,
          thumbnail: thumbnail,
      }
      myPlaylistItems.push(myPlaylistItem);   
      console.log('myPlaylistItems',myPlaylistItems);
      }



      // Remove item from Playlist
      app.removeFromPlaylist = function(data) {

      const title = $(data).parent().prev().children().contents().text();
      myPlaylistItems = myPlaylistItems.filter((item) => item.title !== title);
      console.log('array',myPlaylistItems);
    }


    //function to play the youtube in a separate tab
     app.playVideo = function(data) {

      console.log('data ID', data, data.id.videoId );
      const youtubeUrl = `https://www.youtube.com/watch?v=${data.id.videoId}`;
      window.open(youtubeUrl);
    }


     // API call to Discogs to get releases 

        async function getArtists(findArtist) {
         try {
          const searchResults = await $.ajax(`https://api.discogs.com/artists/${findArtist.id}/releases?key=${app.key}&secret=${app.secret}&per_page=30&sort=year&sort_order=desc`);
          console.log('searchResults',searchResults);
          app.displayReleases(searchResults.releases);

         } catch(err) {
          console.log('searchResults',searchResults);
           console.log('error');
         }
       }

        // API call to Discogs to get the artists 
  
       async function getImages(searchTerm) {
         try {
          const searchResults = await $.ajax(`https://api.discogs.com/database/search?key=${app.key}&secret=${app.secret}&q=${searchTerm}&type=artist&per_page=100`);
          console.log('searchResults',searchResults);
          app.displayArtists(searchResults.results);

         } catch(err) {
          console.log('searchResults',searchResults);
           console.log('error');
         }
       }

      
       //API call to youtube to get the song
     async function getVideo(artist,title) {
        const youtubeSearchKey = artist + ' ' +title;
        console.log('youtubeSearchKey',youtubeSearchKey);

        try{
           const response = await $.ajax(`https://www.googleapis.com/youtube/v3/search?key=${app.gkey}&q=${youtubeSearchKey}&maxResults=1&type=video`);
          app.playVideo(response.items[0]);   
        }
        catch(err){
            console.log("Request Failed");
        }
      }

      app.init = function() {
  
          $('form').submit(function(e){

              e.preventDefault();
              $('.search-results').empty();
              const searchTerm = $('#search-input').val();
              getImages(searchTerm);
              
          });

          $('.home').on('click',function(){
            artists =[];
          });
          
          $('.library').on('click', function(e){
            e.preventDefault();
            app.displayMyPlaylist();

          })

          $('.search-results').on('click', '.addButton', function(data) {
          app.addToPlaylist(this);
          $(this).text('Remove Item').toggleClass('removeButton addButton');

          });

          $('.search-results').on('click', '.removeButton' ,function(data){
          app.addToPlaylist(this);
          app.removeFromPlaylist(this);
          $(this).text('Add to playlist').toggleClass('addButton removeButton' );
          });


         $('.library-results').on('click', '.removeButton', function(data) {

          app.removeFromPlaylist(this);
          app.displayMyPlaylist();
          $(this).text('Add to playlist').toggleClass('addButton removeButton');
          });

          $('.search-results').on('click', '.artist', function(event) {
            
           const find =  $(this).find('p').text();
           const findArtist =  artists.find(function(item){
             return item.title === find;
            });
           getArtists(findArtist);
          });

          $('.search-results').on('click', '.release-name , .release-image', function(data){
              const artist = $(this).parent().children('div').eq(1).children('p').eq(1).text();
              const title = $(this).parent().children('div').eq(1).children('p').eq(0).text();
              getVideo(artist,title);

          });
      
        };

      $(function() {

          app.init();
         
      });
      
  