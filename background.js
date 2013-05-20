setInterval(process_network_queue, 2000)
setInterval(fetch_study_status, 3000)
setInterval(function () {load_store()}, 1000)
setInterval(refresh_expired_blocks, 1000)

function refresh_expired_blocks () {
    store.websites.each(function (site) {
        if (site.block_start_time && time_left(site) < 0) {
            site.our_offer = null;
            site.user_offer = null;
            site.block_start_time = null;
        }
    });
    store.save()
}