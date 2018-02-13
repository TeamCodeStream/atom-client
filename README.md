# CodeStream

CodeStream puts team chat into Atom (and other IDEs) so that developers can discuss code where they code. Conversation threads automatically become annotations that live with the codebase forever, so your codebase gets smarter over time.

**NOTE:** CodeStream is currently in private beta. Visit [codestream.com](https://www.codestream.com) to learn more and request an invitation.

![FullIDE](https://codestream.zendesk.com/hc/article_attachments/360000712271/CodeStream.png)

Regardless of what chat service your team is using, talking about code in a meaningful way can be tedious. Copy a block of code in your IDE, head over to the appropriate chat channel, paste the code, provide some context (repo, file, line numbers), and maybe open a terminal and do a git blame to see who originally wrote the code so that you can @mention them. Then you can ask your question… finally!

With CodeStream, each source file has its own chat stream. Just go to the appropriate file, select the code and type your question. Done. Context is built right in. Even the author of the code block is automatically mentioned!

![PostCodeBlock](https://codestream.zendesk.com/hc/article_attachments/360000712411/PostCodeBlock.PNG)

If you were lucky enough to get your question answered in the chat channel, chances are that once the discussion scrolls out of view it will effectively be lost forever. A new developer that takes over the code down the road will never benefit from that discussion.

With CodeStream, the discussion lives on with the source file forever, and is even associated with specific commits. You’re effectively building a knowledge base over time, with zero additional effort.

![ThreadMarker](https://codestream.zendesk.com/hc/article_attachments/360000704952/ThreadMarker.png)

# Requirements

* CodeStream requires a current version of **[Atom](https://atom.io/)**.
* Your repository must be managed by Git, or a Git hosting service like GitHub.
* Forking workflows aren’t currently supported.
* Make sure that you have just a single repository open in any one Atom window. Support for multiple repos is coming soon.
* Make sure you open an actual repository, and not a directory containing repositories.

# Installation

Search for CodeStream in the Atom package manager, or from the command line:

`apm install codestream`

Once installed, toggle the CodeStream view via the Packages menu, or hit Cmd + Opt + O (Mac) / Ctrl + Alt + O (Windows). You can also click on the CodeStream logo that now appears in Atom’s statusbar.

If there are issues installing the plugin dependencies:

## OSX Users

* Run `sudo xcode-select --install`
* `cd ~/.atom/packages/codestream`
* `apm install`
* If there are still issues, you'll need to install libgcrypt. This can be done with homebrew via `brew install libgcrypt` or you by means of another package manager. Once installed, re-run `apm install`.

## Linux Users

* You need `libssl-dev`. On ubuntu, you can use `sudo apt install libssl-dev`.
* `cd ~/.atom/packages/codestream`
* `apm install`

# Help

Check out our [help site](https://help.codestream.com) for more information on getting started with CodeStream.
