[![CodeStream Logo](https://alt-images.codestream.com/codestream_logo_atommarketplace.png)](https://codestream.com?utm_source=atommarket&utm_medium=banner&utm_campaign=codestream)

# CodeStream

The World's Best Code Discussion Tool. Take the pain out of code reviews, resolve issues faster, and dramatically improve code quality by increasing communication between the developers on your team.

Discussing code is now as easy as highlighting a code block and typing a comment or question. No PRs required.

![CodeStream](https://raw.githubusercontent.com/TeamCodeStream/CodeStream/master/images/animated/SpatialAtom2.gif)

# Requirements

- CodeStream requires version 1.34 or later of [Atom](https://atom.io/).
- Your repository must be managed by Git, or a Git hosting service like GitHub.

# Installation

You have two options for installing CodeStream.

- Search for "CodeStream" in Atom's built-in package manager and install from there.
- Or, run the command `apm install codestream` in your terminal.

# Discuss Code, Right in Your IDE

## Create a Codemark

A codemark is a discussion connected to a block of code. Simply select a block of code in your editor and then type a question or comment. Keep in mind that you can discuss any line of code in any source file at any time, even if it’s code that you just typed into your editor and haven’t yet saved or committed. You don’t need PRs or have to wait for code review to get or provide feedback.

![New Codemark](https://raw.githubusercontent.com/TeamCodeStream/CodeStream/master/images/NewCodemarkWithText3.png)

See a problem in the code, or something that needs to be refactored, make sure it gets done by creating an “Issue” codemark and adding an assignee.

![New Issue](https://raw.githubusercontent.com/TeamCodeStream/CodeStream/master/images/NewIssueWithText.png)

CodeStream integrates with Jira, Trello, GitHub, GitLab, Bitbucket, Azure DevOps, YouTrack and Asana, making it easy to create an issue tied to a specific block of code, and have that issue appear in your existing issue-tracking service.

![Jira Ticket](https://raw.githubusercontent.com/TeamCodeStream/CodeStream/master/images/IssueOnJira.png)

## Connected to the Code

Each codemark contributes to your team’s knowledge base and remains connected to the block of code it refers to… even as the file changes over time. Move the block of code to a different section of the file, and the codemark moves right along with it.

Surfacing discussions contextually is what makes your knowledge base valuable. When a new developer joins your team six months, or three years, from now and is working in this section of the codebase, they’ll see the past discussion, review it, and get a better understanding of why the code looks the way it does.

![Codemark Connected to Code](https://raw.githubusercontent.com/TeamCodeStream/CodeStream/master/images/CodemarkInSpatial-Atom.png)

Imagine how much less painful it will be when a key developer leaves the team (along with all of her institutional knowledge) if the new developers got to work from an annotated codebase!

## Activity Feed

The activity feed is the definitive place to find out about new codemarks posted by your teammates, or new replies to existing codemarks.

![Activity Feed](https://raw.githubusercontent.com/TeamCodeStream/CodeStream/master/images/ActivityFeed.png)

Note that CodeStream’s entry in your IDE’s status bar also lets you know when there are new messages in the feed.

![Status Bar](https://raw.githubusercontent.com/TeamCodeStream/CodeStream/master/images/StatusBarWithMentions-Atom.png)

## Share on Slack or MS Teams

When you post a codemark your teammates will get notified via the activity feed, and potentially via email as well. Sometimes, though, you might also want to share the codemark out to Slack or MS Teams.

![Share on Slack](https://raw.githubusercontent.com/TeamCodeStream/CodeStream/master/images/ShareOnSlack1.png)

On a codemark by codemark basis you can decide if and where to share.

# Frequently Asked Questions

#### Where are messages stored?

Your team’s codemarks, which include the message text and the code snippet, are stored in the cloud on CodeStream’s servers. CodeStream uses best practices when it comes to [security](https://www.codestream.com/security), but if your team has stringent infosec requirements we also offer an [on-prem solution](https://github.com/TeamCodeStream/onprem-install/wiki).

#### What access to Git does CodeStream require?

You won’t need to provide CodeStream with any Git (or GitHub, Bitbucket, etc.) credentials, as the extension simply leverages your IDE’s access to Git. CodeStream uses Git to do things like automatically mention the most recent author when you share a block of code in a post, and to maintain the connection between that block of code and where it’s located in the source file as the file evolves over time (and commits).

#### What is CodeStream's pricing model?

Codestream is free to try for 30 days for teams of all sizes. CodeStream is free to use for small teams with 5 or fewer developers, educational organizations, and for open source projects. For all other teams, pricing starts at \$10/user/month. To learn more, visit https://www.codestream.com/pricing or contact sales@codestream.com.

# Help & Feedback

Check out our [wiki](https://github.com/TeamCodeStream/CodeStream/wiki) for more information on getting started with CodeStream. Please follow [@teamcodestream](http://twitter.com/teamcodestream) for product updates and to share feedback and questions. You can also email us at support@codestream.com.
