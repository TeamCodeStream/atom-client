# Change Log

## [7.0.0] - 2020-4-3

### Added

- Code review functionality is no longer in private beta and is now available for all teams
- Adds new "Live View" of what your teammates are working, including warnings about potential merge conflicts
- Adds warnings to the top of the Current File view when a teammate is editing the same file or if there's a potential merge conflict
- Addresses [#162](https://github.com/TeamCodeStream/CodeStream/issues/162) &mdash; Adds admin capabilities and team settings
- Adds the ability for an admin to rename the team
- Adds the ability for an admin to assign/remove admin privileges
- Adds the ability for an admin to remove people from the team
- Adds the ability for an admin to control Live View usage for the team
- Adds the ability for users to change their username
- Adds the ability for users to change their full name
- Adds the ability for users to cancel their accounts

### Changed

- Changes status bar entry from "Sign in..." to "CodeStream" when user is signed out
- Prevents the creation of codemarks when viewing a non-code review diff

### Fixed

- Fixes [#160](https://github.com/TeamCodeStream/CodeStream/issues/160) &mdash; Blank CodeStream pane after starting up VSC
- Fixes [#166](https://github.com/TeamCodeStream/CodeStream/issues/166) &mdash; Error creating codemarks
- Fixes [#168](https://github.com/TeamCodeStream/CodeStream/issues/168) &mdash; Can't post issues to GitHub
- Fixes an issue with the diff for a new file added to a code review being blank

## [6.5.1] - 2020-4-1

### Fixed

- Fixes an issue receiving real-time events for on-prem customers

## [6.5.0] - 2020-3-31

### Added

- Adds the ability to sign into CodeStream with GitHub

## [6.4.0] - 2020-3-27

### Added

- Adds the ability to email and desktop notifications on/off separately
- Adds confirmation message after submitting a code review, or a codemark with no associated code block

### Changed

- When viewing a codemark the entire code block is now clickable and will open the given file

## [6.3.3] - 2020-3-24

### Added

- Mentions on CodeStream now flow through to Slack if there's a match on email address or username

### Fixed

- Fixes an issue with the Compare and Apply buttons not appearing right away when there's a diff

## [6.3.2] - 2020-3-19

### Fixed

- Fixes an issue with codemarks getting created without a code block when the file path included Cyrillic characters
- Fixes an issue with codemarks getting created without a code block when the team contained replies from Slack users that weren't a member of the team

## [6.3.1] - 2020-3-17

### Fixed

- Fixes an issue with the "Open & Assigned to Me" filter not including issue codemarks

# [6.3.0] - 2020-3-10

### Added

- Adds the ability to create an issue not connected to a block of code via the + menu in the global nav

### Changed

- More robust Filter & Search tab with an improved UI, [advanced search syntax](https://github.com/TeamCodeStream/CodeStream/wiki/Filter-and-Search), and the ability to save custom filters
- More readable activity feed UI, with author/action separated out from each card

### Fixed

- Fixes an issue sharing to Slack when there are spaces in the remote URL

## [6.2.1] - 2020-2-26

### Changed

- Shortened the gutter marker tool tips to 80 characters max


## [6.2.0] - 2020-2-19

### Added

- Adds the ability to share codemarks to Microsoft Teams

### Fixed

- Fixes an issue with access tokens expiring for the Jira integration

## [6.1.0] - 2020-2-3

### Added

- Adds the ability to create additional CodeStream teams from the ellipses menu in the top nav

### Changed

- The pull-request integrations will now display comments from open PRs if you are on either the source or destination branches

## [6.0.1] - 2020-1-27

### Fixed

- Fixes [#146](]https://github.com/TeamCodeStream/CodeStream/issues/146) &mdash; Unclear that duplicated shortcut label means keychord
- Fixes an issue that could lead to degraded IDE performance when CodeStream is opened with very large source files
- Fixes an issue where the compose menu in the CodeStream pane would not persist if you switched files while code was selected

## [6.0.0] - 2020-1-14

### Added

- Adds a new Activity Feed to notify you about new codemarks and new replies to codemarks
- Adds the ability for CodeStream teams to optionally share codemarks to Slack, without requiring broad access to your workspace
- Adds the ability to share any existing codemark, including those created by teammates, to Slack
- Adds the ability to reply to codemarks from Slack via a "View Discussion & Reply" button
- Adds the ability to specify a default sharing destination on Slack per repo (look for gear menu at top of the channel-selection dropdown)
- Adds new codemark-centric email notifications, which allow you to post replies by simply replying to the email
- Adds new notification settings under the ellipses menu in the top nav
- Adds the ability to manually follow/unfollow individual codemarks to control notifications
- Adds the ability to create a codemark via the "+" button in the top nav, where the code block is optional
- Adds a new Team tab to the top nav where you can invite teammates and see those already on the team
- Adds repo name to the display of codemarks

### Changed

- Assignment of an issue (excluding those shared externally) is now treated like a mention so that the assignee is notified

### Fixed

- Fixes [#139](]https://github.com/TeamCodeStream/CodeStream/issues/139) &mdash; GitHub PR comments not showing up

## [5.2.5] - 2019-12-20

### Fixed

- Fixes an issue with repo matching on startup

## [5.2.4] - 2019-12-19

### Added

- Adds a roadblock to let people know when CodeStream can't connect due to possible proxy issues

### Changed

- The form to create a codemark is now keyboard navigable

### Fixed

- Fixes an issue with creating codemarks that include blank line at the end of a file
- Fixes a broken link on the form to configure the GitLab Self-Managed integration

## [5.2.3] - 2019-11-27

### Added

- Adds support for self-signed SSL certificates for CodeStream On-Prem
- Adds display of CodeStream version number at the bottom of the ellipses menu

### Fixed

- Fixes an issue with very large codemarks not being displayed on Slack
- Fixes an issue with "Open on GitHub" buttons not accounting for .com-githubHandle remote syntax

## [5.2.2] - 2019-11-19

### Added

- Adds support for merge request comments from GitLab via the "PR" toggle on the Current File tab

### Changed

- When you cancel the creation of a codemark you are now prompted to confirm the action<
- By default, codemarks are now displayed as glyphs in the editor even when the Current File tab is selected

### Fixed

- Fixes an issue with the display of codemarks, as well as the codemark creation form, near the bottom of a file
- Fixes an issue where Slack DMs sometimes weren't available for sharing a codemark

## [5.2.0] - 2019-11-6

### Changed

- Repo matching logic now also includes commit hashes to better handle scenarios where teammates don't have a common remote URL for the same repo

### Fixed

- Fixes an issue where the codemark compose form and the newly-created codemark would briefly appear at the same time
- Fixes an issue where the current codemark was available for selection as a related codemark

## [5.1.0] - 2019-10-30

### Added

- Adds "Open in IDE", "Open on Web" and "Open on GitHub" (or Bitbucket/GitLab) links to issues created in external issue-tracking services (Jira, Trello, etc.)
- Adds the ability to manually reposition a codemark in cases where its location isn't automatically updated based on changes to the code

### Changed

- Changed the "Open on CodeStream" button in posts to Slack / MS Teams to "Open on Web"
- Improvements on codemark location calulation
- The standard font size in the CodeStream tab will match that of the tree-view and status bar

### Fixed

- Fixes an issue with editing replies
- Fixes an issue with the dropdowns for Author and Branch on the Search tab not working
- Fixes an issue with the formatting of code blocks in issues created on YouTrack
- Fixes an issue where the "Open in IDE" button, for codemarks with multiple locations, would always open to the first location
- Fixes issues with "Open in IDE" from codemark pages in Firefox

## [5.0.1] - 2019-10-18

### Fixed

- Fixes an issue with codemarks disappearing after a commit

## [5.0.0] - 2019-10-16

### Added

- Add the ability to have multiple blocks of code, even across files/repos, associated with a single codemark
- Adds the ability to create issues on GitLab Enterprise

### Changed

- Codemarks can now be created and shared with your teammates even if you have unpushed commits
- Archived codemarks and resolved issues are now both controlled by the Archived filter on the Current File tab

### Fixed

- Fixes an issue where assignee wasn't being set correctly for issues created on GitLab
- Fixes an issue with the Asana integration where tasks weren't getting created

## [4.0.1] - 2019-10-2

### Added

- Adds the ability to filter codemarks on the Search tab by author, branch or commit

### Fixed

- Fixes an issue with changing issue-tracking services via the dropdown on the codemark form

## [4.0.0] - 2019-10-1

### Added

- Comments on merged-in pull requests from either GitHub or Bitbucket are now displayed right alongside the code blocks they refer to
- The ability to inject a codemark as an inline comment now has an option to include replies

### Fixed

- Fixes an issue where an issue codemark with a blank description would not get posted to Slack
- Fixes an issue where automated closed/opened messages for issue codemarks were not getting posted to Slack
- Fixes the sort order of Jira projects so that they are in alphabetical order
- Fixes an issue where the ability to star a reply was missing for Slack-connected teams
- Fixes an issue where Slack desktop notifications for codemarks would not include any content

## [3.0.1] - 2019-9-20

### Added

- Adds options to codemarks shared on Microsoft Teams to open a codemark on the web, in your IDE or, in the case of issues, on the issue-tracking service
- Adds new tophat to display of codemarks when the referenced code has been deleted

### Changed

- The bookmark codemark type has been removed, to be brought back at a future date

### Fixed

- Fixes [#117](]https://github.com/TeamCodeStream/CodeStream/issues/117) &mdash; Deleting codemark from Search tab causes unexpected error
- Fixes [#116](]https://github.com/TeamCodeStream/CodeStream/issues/116) &mdash; Creating codemark takes you out of List view
- Fixes [#115](]https://github.com/TeamCodeStream/CodeStream/issues/115) &mdash; Tab then enter discards codemark
- Fixes an issue with incorrect range being selected when code highlighted from the bottom up, and context menu used to create codemark
- Fixes an issue with permalinks being displayed on the Search tab

## [3.0.0] - 2019-9-17

### Added

- Adds a "Copy link" menu option for all codemarks so that they can be shared anywhere at any time
- Adds new web-based codemark pages to display codemarks shared via link
- Adds options to codemarks shared on Slack to open a codemark on the web, in your IDE or, in the case of issues, on the issue-tracking service
- When opening a codemark in your IDE from Slack or the web, if you don't happen to have the given repo open, CodeStream will still open the file for you automatically if you've ever opened that repo while signed into CodeStream. If not, we'll prompt you to open the repo, and we'll remember the location so you don't have to do that again.
- Adds a team switcher under the ellipses menu to switch between all of your CodeStream teams
- For on-prem installations, adds a check to make sure that the version of the API server running is compatible with the extension

### Fixed

- Fixes a rate limiting issue experienced by certain teams authenticating with Microsoft Teams
- Fixes an issue with deleting replies to a codemark
- Fixes an issue with syncing with YouTrack after authenticating
- Fixes an issue where a codemark created against unsaved code would not appear immediately

## [2.1.2] - 2019-9-9

### Added

- Addresses [#79](]https://github.com/TeamCodeStream/CodeStream/issues/79) &mdash; Adds branch info to codemark display when there's a diff
- Adds the ability to inject a codemark as an inline comment

### Fixed

- Fixes a rate limiting issue experienced by certain teams authenticating with Microsoft Teams
- Fixes an issue where replies to a codemark in a Slack-connected team would briefly appear twice
- Fixes an issue where there was no confirmation message when adding a user to a channel via slash command

## [2.1.0] - 2019-8-20

### Added

- Adds more robust tagging functionality, allowing you to create tags with any color / text label combination
- Adds the ability to link parts of your codebase by adding "related" codemarks to a parent codemark, and then using the links to jump around the codebases

### Changed

- Improved display of collapsed codemarks to make it easy to see tags, assignees, linked issues (i.e., on an external service like Jira), and the presence of replies or related codemarks
- All new cleaner display of expanded codemarks, with replies now displayed in descending order (i.e., most recent first)
- Consistent display of codemarks across all areas of CodeStream
- Smoother scrolling of codemarks in the CodeStream pane

### Fixed

- Fixes an issue with the positioning of the codemark form when creating a codemark at the bottom of the viewport
- Fixes an issue with not being able to change issue-tracking selection once Azure DevOps has been selected
- Fixes an issue with password reset in CodeStream on-prem

## [2.0.0] - 2019-8-1

### Added

- Adds issue-tracking integrations with Jira Server and GitHub Enterprise

### Changed

- Updates the UI for creating issues on external issue tracking services to allow you to be connected to multiple services at once and change the selection on an issue by issue basis
- Codemarks now appear immediately upon submission
- Trailing slashes are stripped off of the Server URL setting for on-prem installations

### Fixed

- Fixes an issue with not all DMs from Slack appearing in the conversation selector when creating a codemark
- Fixes an issue with a lack of notification when viewing a codemark in a file you don't have

## [1.3.4] - 2019-7-26

### Added

- Adds roadblocks when your extension is behind either a required or suggested version of CodeStream

### Fixed

- Fixes [#71](]https://github.com/TeamCodeStream/CodeStream/issues/71) &mdash; You can edit channel selection when editing via thread view

## [1.3.2] - 2019-7-16

### Changed

- Added a "Back" link below the password-reset form in case you change your mind

### Fixed

- Fixes [#70](]https://github.com/TeamCodeStream/CodeStream/issues/70) &mdash; Once joined more than one channel, I can't choose into which channel a comment should go to anymore
- Fixes an issue with repos managed by Bitbucket Server incorrectly being identified as being managed by Bitbucket cloud
- Fixes scrolling issues when creating and viewing longer codemarks

## [1.3.1] - 2019-7-10

### Added

- Password reset. Sorry it took so long!
- Enforcement of CodeStream's 30-day free trial, and 5-member limit for teams on the free plan

### Changed

- Optimizations to ipc between our processes and plugin startup

### Fixed

- Fixes an issue where scrolling in the CodeStream pane with the compose modal open would lose any information already entered
- Fixes an issue where a codemark could get posted as a reply to another codemark if you had thread view open
- Fixes a spacing issue on the Sign In page
- Fixes an issue with new UI not being applied to email confirmation and Team Name pages
- Fixes rendering issues with certain Slack bots when using Slack real-time channels

## [1.3.0] - 2019-6-26

### Added

- New Microsoft Teams integration allows you to share codemarks in your organization's existing channels. [Learn more.](https://www.codestream.com/blog/codestream-1-3)
- New Slack integration that reduces the amount of Slack that appears in CodeStream, with the full Channels tab now being optional

### Changed

- Updated the UI of CodeStream's signup flow
- Asana projects are now listed in alphabetical order for selection

### Fixed

- Fixes an issue with code blocks in Trello cards not rendering properly, and not including the line numbers

## [1.2.0] - 2019-6-14

### Added

- Adds the ability to compare the code associated with a codemark to your local version of the file, or to apply the change

### Changed

- The Invite People page now only shows teammates from your Slack workspace that have signed up for CodeStream

### Fixed

- Fixes an issue that would cause an error when opening a Slack channel with Japanese characters in the name
- Fixes an issue where hovering over an expanded codemark wouldn't highlight the corresponding code block in the editor
- Fixes an issue with text in backticks not rendering properly
- Fixes an issue with new lines being displayed as html in posts on Slack
- Fixes an issue with new lines in codemark text causing display issues on the Search tab
- Fixes an issue with the Asana integration that was preventing projects from being listed
- Fixes an issue with invitation codes incorrectly expiring after 10 minutes
- Fixes an issue with editing a reply from a codemark's thread view

## [1.1.0] - 2019-6-4

### Changed

- Signup flow is now based in the IDE instead of on the web
- For CodeStream teams, invitations are now code-based allowing for quicker signup
- For Slack teams, invitation URLs have been simplified
- Clicking on a codemark in the editor gutter opens the codemark in the Current File tab in CodeStream

### Fixed

- Fixes [#60](]https://github.com/TeamCodeStream/CodeStream/issues/60) &mdash; can't delete codemark in vscode
- Fixes [#57](https://github.com/TeamCodeStream/CodeStream/issues/57) &mdash; Cygwin git support
- Fixes an issue with bookmark titles not being displayed on Slack
- Fixes an issue with code snippets added to a codemark via markdown not rendering

## [1.0.3] - 2019-5-22

### Fixed

- Fixes an issue where a new codemark sometimes wouldn't appear right away
- Fixes an issue where git repos with remote URLs containing port numbers would prevent codemarks from being displayed properly
- Fixes [#61](https://github.com/TeamCodeStream/CodeStream/issues/61) &mdash; Formatting issues with codemarks

## [1.0.2] - 2019-5-15

### Added

- Adds an integration with YouTrack issue tracking

## [1.0.0] - 2019-05-13

### Added

- Initial beta release for the Atom marketplace
