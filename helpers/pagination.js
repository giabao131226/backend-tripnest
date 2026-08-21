module.exports = async (search,objectPagination) => {
    if(parseInt(search.page)){
        objectPagination.currentPage = parseInt(search.page);
    }else objectPagination.currentPage = 1

    objectPagination.skip = (objectPagination.currentPage-1)*objectPagination.limitItems;
    console.log(search.page,objectPagination)
}