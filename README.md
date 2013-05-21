utilitracker
============


Here's how block/unblocking works:

Let's say we want blocking to last for 3 hours.  But we only want to
ask people once every day.  You do that with:

    store.hours_per_block = 3
    store.hours_per_cycle = 24

Then once every 24 hours cycle, it'll prompt the user for a 3 hour
block.

If the user starts blocking in hour 23, the block will continue past
that cycle, finishing in hour 2 of the next cycle.

Cycles are started either when (1) the last cycle expired, or (2) the
study just went from disabled to enabled (as set on the server).  The
current cycle's start time is stored in:

    store.cycle_start_time

And each website's block start time is stored in:

    store.website[n].block_start_time

You set these variables on the server, and they'll get loaded in an
ajax request that refreshes every 20 seconds or so, inside of
background.js.  There are a few background jobs that also run from
here:

  - Refreshing study parameters from the server
  - Refreshing each website's block state in a new cycle
  - Sending data to the server (in a network queue)
