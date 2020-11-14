(async function laod()
{   
    
    async function getData(url)
    {
        const response = await fetch(url)
        const data = await response.json()
        if(data.data.movie_count > 0)
        {
            return data
        }
        throw new Error('No se encontró ningun resultado')
    }
    const $featuringContainer = document.getElementById('featuring')
    function setAttributes($element, attributes)
    {
        for(const attribute in attributes)
        {
            $element.setAttribute(attribute, attributes[attribute])
        } 
    }
    const $home = document.getElementById('home')
    const $form = document.getElementById('form')
    function featuringTemplate(element)
    {
        return (
            `
            <div class="featuring">
                <div class="featuring-image">
                    <img src="${element.medium_cover_image}" width="70" height="100" alt="">
                </div>
                <div class="featuring-content">
                    <p class="featuring-title">Pelicula encontrada</p>
                    <p class="featuring-album">${element.title}</p>
                </div>
            </div>
            `
        )
    }
    $form.addEventListener('submit', async (event) =>
    {   
        event.preventDefault();
        $home.classList.add('search-active')
        const $loader = document.createElement('img')
        const data = { src: 'src/images/loader.gif', width: 50, height: 50 }
        setAttributes($loader, data)
        $featuringContainer.append($loader)
        const dataForm = new FormData($form)
        try {
            const { data:{ movies: dataMovie }} = await getData(`${BASE_API}list_movies.json?limit=1&query_term=${dataForm.get('name')}`)
            const HTMLString = featuringTemplate(dataMovie[0])
            $featuringContainer.innerHTML = HTMLString
        }
        catch(error) {
            alert(error)
            $loader.remove();
            $home.classList.remove('search-active')
        }
    })

    const BASE_API = 'https://yts.mx/api/v2/';
    
    function videoItemTemplate(movie, category)
    {
        return (
            `<div class="primaryPlaylistItem" data-id="${movie.id}" data-category="${category}">
                <div class="primaryPlaylistItem-image">
                    <img src="${movie.medium_cover_image}">
                </div>
                <h4 class="primaryPlaylistItem-title">
                    ${movie.title}
                </h4>
            </div>`
        )
    }
    function createTemplateDom(HTMLString)
    {
        const html = document.implementation.createHTMLDocument();
        html.body.innerHTML = HTMLString
        return html.body.children[0]
    }
    function addEventClick($element)
    {
        $element.addEventListener('click', () => 
        {
            showModal($element)
        })
    }
    function renderMoveList(list, $container, category)
    {
        $container.children[0].remove();
        list.forEach( (movie) => 
            {
              const HTMLString = videoItemTemplate(movie, category);
              const movieElement = createTemplateDom(HTMLString)
              $container.append(movieElement);
              const img = movieElement.querySelector('img')
              img.addEventListener('load', () => 
              {
                  movieElement.classList.add('fadeIn')
              })
              addEventClick(movieElement)
            })
    }
    const { data: { movies: actionList }} = await getData(`${BASE_API}list_movies.json?genre=action`);
    window.localStorage.setItem('actionList', JSON.stringify(actionList))
    const $actionContainer = document.getElementById('action')
    renderMoveList(actionList, $actionContainer, 'action')

    const { data: { movies: dramaList }} = await getData(`${BASE_API}list_movies.json?genre=fantasy`);
    window.localStorage.setItem('dramaList', JSON.stringify(dramaList))
    const $dramaContainer = document.getElementById('drama')
    renderMoveList(dramaList, $dramaContainer, 'drama')

    const { data: { movies: animationList }} = await getData(`${BASE_API}list_movies.json?genre=animation`);
    window.localStorage.setItem('animationList', JSON.stringify(animationList))
    const $animationContainer = document.getElementById('animation')
    renderMoveList(animationList, $animationContainer, 'animation')


    const $modal = document.getElementById('modal')
    const $overlay = document.getElementById('overlay')
    const $hideModal = document.getElementById('hide-modal')
    $hideModal.addEventListener('click', hideModal)
    
    function findData(list, id)
    {
        return list.find( (event) => event.id === parseInt(id))
    }

    function findMovie(id, category)
    {   
        switch(category)
        {
            case 'action': {
                return findData(actionList, id)
            }
            case 'drama': {
                return findData(dramaList, id)
            }
            default: {
                return findData(animationList, id)
            }
        }
    }
    const $modalTitle = $modal.querySelector('h1')
    const $modalImage = $modal.querySelector('img')
    const $modalDescription = $modal.querySelector('p')

    function showModal($element)
    {
        $overlay.classList.add('active');
        $modal.style.animation = 'modalIn .8s forwards';
        const {id, category} = $element.dataset
        const data = findMovie(id, category)
        $modalTitle.textContent = data.title
        $modalImage.setAttribute('src', data.medium_cover_image)
        $modalDescription.textContent = data.description_full
    }
    function hideModal()
    {
        setTimeout( ()=>
        {
            $overlay.classList.remove('active');
        } , 710)
        $modal.style.animation = 'modalOut .8s forwards';

    }

    async function getDataFriendsAndMovies(url)
    {
        const response = await fetch(url)
        const data = await response.json()
        return data
    }

    const $friends = document.getElementById('friends')
    const { results: listFriends } = await getDataFriendsAndMovies('https://randomuser.me/api/?results=8')


    function createUserTemplate(title, first, last, img)
    {
        return(
            `
            <li class="playlistFriends-item">
                <a href="#">
                <img src="${img}"/>
                <span>
                    ${title} ${first} ${last}
                </span>
                </a>
            </li>
            `
        )
    }
    async function renderUserList()
    {
        listFriends.forEach( (user) => 
        {
            const HTMLString = createUserTemplate(user.name.title, user.name.first, user.name.last, user.picture.thumbnail)
            const userElement = createTemplateDom(HTMLString)
            $friends.append(userElement)
        })
    }
    renderUserList();
    
    function renderPlaylistTemplate(movie)
    {
        return(
            `
            <li class="myPlaylist-item">
              <a href="#">
                <span>
                  ${movie}
                </span>
              </a>
            </li>
            `
        )
    }
    const $playlist = document.getElementById('playlist')
    const { data: { movies: listMyPlaylist }} = await getDataFriendsAndMovies(`${BASE_API}list_movies.json?limit=9`);
    listMyPlaylist.forEach( (movie) => 
    {
        const HTMLString = renderPlaylistTemplate(movie.title)
        $playlist.innerHTML += HTMLString
    })

}   

)()