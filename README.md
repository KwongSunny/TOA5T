Bot-Name: PixelBot (temporary name)

Done utilities:
    
    Autorole - assigns a default role to a server, new members will get this role upon joining [DONE] 
    permissions: MANAGE_ROLES, ADMINISTRATOR

    Ban - bans a user permanently by mention [DONE] 
    permissions: BAN_MEMBERS, ADMINISTRATOR
    
    Kick - kicks a user by mention or id [DONE - NO CHANGES NEEDED] 
    permissions: KICK_MEMBERS, ADMINISTRATOR

    Unban - unbans a user by id [DONE] 
    permissions: BAN_MEMBERS, ADMINISTRATOR

    Random - random number generator, can also utilitize lists [DONE] 
    permissions: n/a

    Reactionrole - creates a reaction role post which users can react to to get roles [DONE] 
    permissions: MANAGE_ROLES, ADMINISTRATOR

    Resetprefix - Resets the server's bot's prefix to it's default [DONE] 
    permissions: ADMINISTRATOR

    Set prefix - allows a moderator to set the bot prefix for server in case of bot collision [DONE] 
    permissions: ADMINISTRATOR

    Setmaxwarnings - changes the default maximum warnings of the server [DONE] 
    permissions: ADMINISTRATOR 

    Warn - warns a user and records in db, if the user has over the max warnings, ban the user [DONE]
    permissions: BAN_MEMBERS, ADMINISTRATOR

    Music:
        
        Back [DONE] 
        permissions: play_music, ADMINISTRATOR

        Clear [DONE] 
        Permissions: manage_music, ADMINISTRATOR

        Join [DONE] 
        Permissions: manage_music, ADMINISTRATOR

        Leave [DONE] 
        Permissions: manage_music, ADMINISTRATOR

        Loop [DONE] 
        Permissions: play_music, ADMINISTRATOR

        Pause [DONE] 
        Permissions: play_music, ADMINISTRATOR

        Play [DONE] 
        permissions: play_music, ADMINISTRATOR

        Resume [DONE] 
        Permissions: play_music, ADMINISTRATOR

        Skip [DONE] 
        permissions play_music, ADMINISTRATOR

        Song [DONE] 
        permissions: n/a

        Stop [DONE] 
        permissions: play_music, ADMINISTRATOR

        Volume [DONE] 
        permissions: manage_music, ADMINISTRATOR

In Development utilities:

    Help - always needs updates for every command
    permissions: n/a

    info [ON HOLD]
    permissions: n/a

    Raffle [mid testing - should be working properly, need to work on extra options; need to set up permissions] 
    permissions: manage_raffle, ADMINISTRATOR

    Setpermissions [DEV] need to check for valid permissions
    permissions: ADMINISTRATOR

    Listpermissions [DEV] 
    permissions: ADMINISTRATOR

    Music:

        Queue [Needs to be able to see more pages] 
        Permissions: n/a

Planned utilities:

    Event scheduler - use await messages to ask questions and create a post to let ppl sign up for an event; permissions: manage_event

    mute

    deafen

    getwarnings - retrives a user's number of warnings (current and total)

    resetwarnings

    Mod log - sets a channel as a mod log, sends messages on important events in the server

    Message filter - removes messages with slurs, spam, all-caps, etc
    
    Auto warn - warns users for inappropriate messages / keeps a db of warned users
    
    Auto ban - bans users who have already been warned
    
    Temp ban - temporarily bans a user
    
    Music - plays music/videos from youtube

        setmusicperms permissions: administrator
    
    Twitch integration - sets a channel as a twitch announcements channel, anyone who goes online will send a message to the server

    Checkstock - checks the price of a stock

Removed Utilities

    Purge [DEPRECATED - removed to prevent abuse of Discord API]

    Setmusicrole [DEPRECATED - USE setpermissions]
    permissions: ADMINISTRATOR
