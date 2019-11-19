<p align="center">
  <br />
  <a title="Learn more about CodeStream" href="https://codestream.com?utm_source=atommarket&utm_medium=banner&utm_campaign=codestream"><img src="https://alt-images.codestream.com/codestream_logo_atommarketplace.png" alt="CodeStream Logo" /></a>
</p>

# CodeStream

The World's Best Code Discussion Tool. Take the pain out of code reviews, resolve issues faster, and dramatically improve code quality by increasing communication between the developers on your team.

![CodeStream](https://raw.githubusercontent.com/TeamCodeStream/CodeStream/master/images/animated/SpatialAtom.gif)

Discussing code is now as easy as highlighting a code block and typing a comment or question. No PRs required.

## Does your team use Slack or Microsoft Teams?

Sign up for CodeStream using Slack or Microsoft Teams so that discussions about code can be shared in your workspace's/organization's existing channels. You and your teammates can participate in the discussion, even when you're not in the IDE!

# Requirements

- CodeStream requires version 1.34 or later of [Atom](https://atom.io/).
- Your repository must be managed by Git, or a Git hosting service like GitHub.

# Installation

You have two options for installing CodeStream.

- Search for "CodeStream" in Atom's built-in package manager and install from there.
- Or, run the command `apm install codestream` in your terminal.

# Things to Try

## Create a codemark and discuss some code

Create a codemark by selecting a block of code in your editor and then typing a question or comment. Keep in mind that, unlike with other solutions, you can discuss any line of code in any source file at any time, even if it’s code that you just typed into your editor and haven’t yet saved or committed.

![New Codemark](https://raw.githubusercontent.com/TeamCodeStream/CodeStream/master/images/NewCodemark3.png)

In addition to general comments and questions, there are specific types of codemarks for assigning issues, saving bookmarks, or generating a permalink to a specific block of code.

![Issue Codemark](https://raw.githubusercontent.com/TeamCodeStream/CodeStream/master/images/CodemarkIssue3.png)

CodeStream integrates with Jira, Trello, GitHub, Asana, Bitbucket, and GitLab, making it easy to create an issue tied to a specific block of code, and have that issue appear in your existing issue-tracking service.

## Add comments to ongoing discussions

Click on a codemark to participate in the discussion. If you have the repo open, you’ll automatically be taken to the appropriate source file and scrolled to the code block.

![Thread View](https://raw.githubusercontent.com/TeamCodeStream/CodeStream/master/images/ThreadView3.png)

## Leverage your team's knowledge base

A codemark displayed to the right of a block of code means that a discussion took place about that code. Click on the codemark to view the discussion and get some context for the work at hand.

![Codemark in Source File](https://raw.githubusercontent.com/TeamCodeStream/CodeStream/master/images/SpatialSingleMarker1.png)

Click on the Search icon to explore your team’s entire knowledge base. Filters allow you to look at codemarks of a certain type, or a specific color.

![Codemarks tab](https://raw.githubusercontent.com/TeamCodeStream/CodeStream/master/images/CodemarksTab1.png)

# Frequently Asked Questions

#### Where are messages stored?

Your team’s message history is stored in the cloud on CodeStream’s servers. If your team is connected to Slack, however, CodeStream doesn't store your messages at all. The one exception is with codemarks, where the content and code block are stored by CodeStream as part of maintaining your knowledge base.

#### Does it work across branches?

CodeStream recognizes that developers on your team may be working on different branches, or may simply have local changes that result in certain blocks of code being in different locations for each of them. If there are messages associated with those blocks of code, CodeStream ensures that each developer sees the discussion markers in the correct location despite the variations in each of their local buffers.

#### What access to Git does CodeStream require?

You won’t need to provide CodeStream with any Git (or GitHub, Bitbucket, etc.) credentials, as the plugin simply leverages your IDE’s access to Git. CodeStream uses Git to do things like automatically mention the most recent author when you share a block of code in a post, and to maintain the connection between that block of code and where it’s located in the source file as the file evolves over time (and commits).

#### What is CodeStream's pricing model?

Codestream is free to try for 30 days for teams of all sizes. CodeStream is free to use for small teams with 5 or fewer developers, educational organizations, and for open source projects. For all other teams, pricing starts at \$10/user/month. To learn more, visit https://www.codestream.com/pricing or contact sales@codestream.com.

# Help & Feedback

Check out our [wiki](https://github.com/TeamCodeStream/CodeStream/wiki) for more information on getting started with CodeStream. Please follow [@teamcodestream](http://twitter.com/teamcodestream) for product updates and to share feedback and questions. You can also email us at support@codestream.com.
