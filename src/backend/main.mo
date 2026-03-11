import Array "mo:core/Array";
import Map "mo:core/Map";
import Iter "mo:core/Iter";
import Int "mo:core/Int";
import Text "mo:core/Text";
import Time "mo:core/Time";
import List "mo:core/List";
import Order "mo:core/Order";
import Principal "mo:core/Principal";
import MixinAuthorization "authorization/MixinAuthorization";
import AccessControl "authorization/access-control";
import Runtime "mo:core/Runtime";

actor {
  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  public type UserProfile = {
    name : Text;
  };

  let userProfiles = Map.empty<Principal, UserProfile>();

  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view profiles");
    };
    userProfiles.get(caller);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own profile");
    };
    userProfiles.get(user);
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save profiles");
    };
    userProfiles.add(caller, profile);
  };

  type VideoProject = {
    id : Nat;
    owner : Principal;
    title : Text;
    description : Text;
    platform : Text;
    status : Text;
    createdAt : Int;
  };

  module VideoProject {
    public func compareByCreatedAt(a : VideoProject, b : VideoProject) : Order.Order {
      Int.compare(a.createdAt, b.createdAt);
    };

    public func compareByStatus(a : VideoProject, b : VideoProject) : Order.Order {
      Text.compare(a.status, b.status);
    };
  };

  type SocialAccount = {
    platform : Text;
    accountHandle : Text;
  };

  type ScheduledPost = {
    projectId : Nat;
    platform : Text;
    scheduledTime : Int;
    title : Text;
    description : Text;
    status : Text;
  };

  module ScheduledPost {
    public func compareByScheduledTime(a : ScheduledPost, b : ScheduledPost) : Order.Order {
      Int.compare(a.scheduledTime, b.scheduledTime);
    };

    public func compareByStatus(a : ScheduledPost, b : ScheduledPost) : Order.Order {
      Text.compare(a.status, b.status);
    };
  };

  let videoProjects = Map.empty<Nat, VideoProject>();
  let userSocialAccounts = Map.empty<Principal, List.List<SocialAccount>>();
  let projectScheduledPosts = Map.empty<Nat, List.List<ScheduledPost>>();
  var nextProjectId = 0;

  // Video Projects CRUD

  public shared ({ caller }) func createVideoProject(title : Text, description : Text, platform : Text) : async Nat {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can create projects");
    };
    let projectId = nextProjectId;
    let newProject : VideoProject = {
      id = projectId;
      owner = caller;
      title;
      description;
      platform;
      status = "draft";
      createdAt = Time.now();
    };
    videoProjects.add(projectId, newProject);
    nextProjectId += 1;
    projectId;
  };

  public query ({ caller }) func getVideoProject(projectId : Nat) : async VideoProject {
    switch (videoProjects.get(projectId)) {
      case (null) { Runtime.trap("No project found for ID " # Nat.toText(projectId)) };
      case (?project) {
        if (project.owner != caller and not AccessControl.isAdmin(accessControlState, caller)) {
          Runtime.trap("Unauthorized: Can only view your own projects");
        };
        project;
      };
    };
  };

  public shared ({ caller }) func updateVideoProject(projectId : Nat, title : Text, description : Text, platform : Text, status : Text) : async () {
    switch (videoProjects.get(projectId)) {
      case (null) { Runtime.trap("No project found for ID " # Nat.toText(projectId)) };
      case (?project) {
        if (project.owner != caller and not AccessControl.isAdmin(accessControlState, caller)) {
          Runtime.trap("Unauthorized: Can only update your own projects");
        };
        let updatedProject : VideoProject = {
          project with
          title;
          description;
          platform;
          status;
        };
        videoProjects.add(projectId, updatedProject);
      };
    };
  };

  public shared ({ caller }) func deleteVideoProject(projectId : Nat) : async () {
    switch (videoProjects.get(projectId)) {
      case (null) { Runtime.trap("No project found for ID " # Nat.toText(projectId)) };
      case (?project) {
        if (project.owner != caller and not AccessControl.isAdmin(accessControlState, caller)) {
          Runtime.trap("Unauthorized: Can only delete your own projects");
        };
        videoProjects.remove(projectId);
        projectScheduledPosts.remove(projectId);
      };
    };
  };

  public query ({ caller }) func getAllVideoProjects() : async [VideoProject] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view projects");
    };
    // Admins can see all projects, regular users only see their own
    if (AccessControl.isAdmin(accessControlState, caller)) {
      videoProjects.values().toArray();
    } else {
      let userProjects = List.empty<VideoProject>();
      for (project in videoProjects.values()) {
        if (project.owner == caller) {
          userProjects.add(project);
        };
      };
      userProjects.toArray();
    };
  };

  // Social Accounts Management

  public shared ({ caller }) func addSocialAccount(platform : Text, accountHandle : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can add social accounts");
    };
    let account : SocialAccount = { platform; accountHandle };
    let existingAccounts = switch (userSocialAccounts.get(caller)) {
      case (null) { List.empty<SocialAccount>() };
      case (?accounts) { accounts };
    };
    existingAccounts.add(account);
    userSocialAccounts.add(caller, existingAccounts);
  };

  public query ({ caller }) func getSocialAccounts() : async [SocialAccount] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view social accounts");
    };
    let accounts = switch (userSocialAccounts.get(caller)) {
      case (null) { List.empty<SocialAccount>() };
      case (?accounts) { accounts };
    };
    accounts.toArray();
  };

  // Scheduled Posts Management

  public shared ({ caller }) func schedulePost(projectId : Nat, platform : Text, scheduledTime : Int, title : Text, description : Text) : async () {
    switch (videoProjects.get(projectId)) {
      case (null) { Runtime.trap("No project found for ID " # Nat.toText(projectId)) };
      case (?project) {
        if (project.owner != caller and not AccessControl.isAdmin(accessControlState, caller)) {
          Runtime.trap("Unauthorized: Can only schedule posts for your own projects");
        };
        let post : ScheduledPost = {
          projectId;
          platform;
          scheduledTime;
          title;
          description;
          status = "pending";
        };
        let existingPosts = switch (projectScheduledPosts.get(projectId)) {
          case (null) { List.empty<ScheduledPost>() };
          case (?posts) { posts };
        };
        existingPosts.add(post);
        projectScheduledPosts.add(projectId, existingPosts);
      };
    };
  };

  public shared ({ caller }) func updatePostStatus(projectId : Nat, postIndex : Nat, newStatus : Text) : async () {
    switch (projectScheduledPosts.get(projectId)) {
      case (null) { Runtime.trap("No posts found for project ID " # Nat.toText(projectId)) };
      case (?posts) {
        if (postIndex >= posts.size()) {
          Runtime.trap("Invalid post index");
        };
        let post = posts.at(postIndex);
        switch (videoProjects.get(projectId)) {
          case (null) { Runtime.trap("No project found for ID " # Nat.toText(projectId)) };
          case (?project) {
            if (project.owner != caller and not AccessControl.isAdmin(accessControlState, caller)) {
              Runtime.trap("Unauthorized: Can only update your own posts");
            };
            let updatedPost : ScheduledPost = {
              post with
              status = newStatus;
            };
            posts.put(postIndex, updatedPost);
          };
        };
      };
    };
  };

  public query ({ caller }) func getScheduledPosts(projectId : Nat) : async [ScheduledPost] {
    switch (videoProjects.get(projectId)) {
      case (null) { Runtime.trap("No project found for ID " # Nat.toText(projectId)) };
      case (?project) {
        if (project.owner != caller and not AccessControl.isAdmin(accessControlState, caller)) {
          Runtime.trap("Unauthorized: Can only view scheduled posts for your own projects");
        };
        switch (projectScheduledPosts.get(projectId)) {
          case (null) { [] };
          case (?posts) { posts.toArray() };
        };
      };
    };
  };

  public query ({ caller }) func getAllScheduledPosts() : async [ScheduledPost] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view scheduled posts");
    };
    let postsList = List.empty<ScheduledPost>();
    // Admins can see all posts, regular users only see posts from their own projects
    if (AccessControl.isAdmin(accessControlState, caller)) {
      for (posts in projectScheduledPosts.values()) {
        if (not posts.isEmpty()) {
          postsList.addAll(posts.values());
        };
      };
    } else {
      for ((projectId, posts) in projectScheduledPosts.entries()) {
        switch (videoProjects.get(projectId)) {
          case (?project) {
            if (project.owner == caller) {
              postsList.addAll(posts.values());
            };
          };
          case (null) {};
        };
      };
    };
    postsList.toArray();
  };
};
