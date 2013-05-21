setInterval(process_network_queue, 2000)
setInterval(fetch_study_status, 3000)
setInterval(function () {load_store()}, 1000)
setInterval(refresh_expired_blocks, 1000)

function refresh_expired_blocks () {
    // Clear out any completed blocks from the last cycle period.
    //   - The block must exist (have a start time)
    //   - And have no time left
    //   - And have started before the current cycle started
    store.websites.each(function (site) {
        if (site.block_start_time && time_left(site) < 0
            && site.block_start_time < store.cycle_start_time) {
            site.our_offer = null;
            site.user_offer = null;
            site.block_start_time = null;
        }
    });
    store.save()
}