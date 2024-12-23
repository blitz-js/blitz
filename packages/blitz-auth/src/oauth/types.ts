import {AmazonCognito} from "arctic"
import {AniList} from "arctic"
import {Apple} from "arctic"
import {Atlassian} from "arctic"
import {Auth0} from "arctic"
import {Authentik} from "arctic"
import {Bitbucket} from "arctic"
import {Box} from "arctic"
import {Bungie} from "arctic"
import {Coinbase} from "arctic"
import {Discord} from "arctic"
import {Dribbble} from "arctic"
import {Dropbox} from "arctic"
import {Etsy} from "arctic"
import {EpicGames} from "arctic"
import {Facebook} from "arctic"
import {Figma} from "arctic"
import {Intuit} from "arctic"
import {GitHub} from "arctic"
import {GitLab} from "arctic"
import {Google} from "arctic"
import {Kakao} from "arctic"
import {KeyCloak} from "arctic"
import {Lichess} from "arctic"
import {Line} from "arctic"
import {Linear} from "arctic"
import {LinkedIn} from "arctic"
import {MicrosoftEntraId} from "arctic"
import {MyAnimeList} from "arctic"
import {Naver} from "arctic"
import {Notion} from "arctic"
import {Okta} from "arctic"
import {Osu} from "arctic"
import {Patreon} from "arctic"
import {Polar} from "arctic"
import {Reddit} from "arctic"
import {Roblox} from "arctic"
import {Salesforce} from "arctic"
import {Shikimori} from "arctic"
import {Slack} from "arctic"
import {Spotify} from "arctic"
import {StartGG} from "arctic"
import {Strava} from "arctic"
import {Tiltify} from "arctic"
import {Tumblr} from "arctic"
import {Twitch} from "arctic"
import {Twitter} from "arctic"
import {VK} from "arctic"
import {WorkOS} from "arctic"
import {Yahoo} from "arctic"
import {Yandex} from "arctic"
import {Zoom} from "arctic"
import {FortyTwo} from "arctic"

export type ArcticOAuthClient =
  | AniList
  | Reddit
  | Apple
  | Atlassian
  | Auth0
  | Bitbucket
  | Box
  | Bungie
  | Coinbase
  | Discord
  | Dribbble
  | Dropbox
  | EpicGames
  | Facebook
  | Figma
  | FortyTwo
  | GitHub
  | GitLab
  | Kakao
  | LinkedIn
  | Linear
  | Naver
  | Notion
  | Osu
  | Patreon
  | Shikimori
  | Slack
  | Spotify
  | StartGG
  | Strava
  | Tiltify
  | Tumblr
  | Twitch
  | VK
  | WorkOS
  | Yahoo
  | Yandex
  | Intuit
  // pkce
  | Authentik
  | AmazonCognito
  | Twitter
  | Polar
  | MyAnimeList
  | KeyCloak
  | Salesforce
  | Roblox
  | Lichess
  | MicrosoftEntraId
  | Google
  | Okta
  | Etsy
  | Line
  | Zoom

export enum SupportedOAuthProviders {
  Authentik = "Authentik",
  AmazonCognito = "AmazonCognito",
  Twitter = "Twitter",
  Polar = "Polar",
  MyAnimeList = "MyAnimeList",
  KeyCloak = "KeyCloak",
  Salesforce = "Salesforce",
  Roblox = "Roblox",
  Lichess = "Lichess",
  MicrosoftEntraId = "MicrosoftEntraId",
  Google = "Google",
  Okta = "Okta",
  Etsy = "Etsy",
  Line = "Line",
  Zoom = "Zoom",
  AniList = "AniList",
  Reddit = "Reddit",
  Apple = "Apple",
  Atlassian = "Atlassian",
  Auth0 = "Auth0",
  Bitbucket = "Bitbucket",
  Box = "Box",
  Bungie = "Bungie",
  Coinbase = "Coinbase",
  Discord = "Discord",
  Dribbble = "Dribbble",
  Dropbox = "Dropbox",
  EpicGames = "EpicGames",
  Facebook = "Facebook",
  Figma = "Figma",
  FortyTwo = "FortyTwo",
  GitHub = "GitHub",
  GitLab = "GitLab",
  Kakao = "Kakao",
  LinkedIn = "LinkedIn",
  Linear = "Linear",
  Naver = "Naver",
  Notion = "Notion",
  Osu = "Osu",
  Patreon = "Patreon",
  Shikimori = "Shikimori",
  Slack = "Slack",
  Spotify = "Spotify",
  StartGG = "StartGG",
  Strava = "Strava",
  Tiltify = "Tiltify",
  Tumblr = "Tumblr",
  Twitch = "Twitch",
  VK = "VK",
  WorkOS = "WorkOS",
  Yahoo = "Yahoo",
  Yandex = "Yandex",
  Intuit = "Intuit",
}
